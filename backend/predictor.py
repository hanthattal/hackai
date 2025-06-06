import torch
import os
import numpy as np
import torch.nn as nn
from model_architectures import get_model  # Add this at the top if needed

model_paths = {
    "long": "models/long_term_unified.pt",
    "short": "models/short_term_model.pt",
    "trading": "models/daily_multitask.pt"
}

models = {}

def load_models():
    for name, path in model_paths.items():
        if os.path.exists(path):
            model = get_model(name)  # Pass strategy name to get corresponding model
            model.load_state_dict(torch.load(path, map_location="cpu"))
            model.eval()
            models[name] = model

def predict(strategy, pricing_data, sentiment_score, report_embedding):
    model = models.get(strategy)
    if not model:
        return { "error": "Model not loaded" }

    pricing_tensor = torch.tensor(pricing_data, dtype=torch.float32)
    print("📈 Raw pricing_data:", pricing_data)
    print("📈 Raw pricing_tensor shape:", pricing_tensor.shape)
    print("📈 Raw pricing_tensor dim:", pricing_tensor.dim())

    # Ensure pricing_tensor is 3D: (batch=1, seq_len=T, features=F)
    if pricing_tensor.dim() == 0:
        # scalar -> single step, single feature
        pricing_tensor = pricing_tensor.view(1, 1, 1)
    elif pricing_tensor.dim() == 1:
        # vector -> sequence of single-feature steps
        pricing_tensor = pricing_tensor.view(1, -1, 1)
    elif pricing_tensor.dim() == 2:
        # matrix -> (T, F) -> add batch dimension
        pricing_tensor = pricing_tensor.unsqueeze(0)
    # else dim >=3: assume already has batch

    print("📈 Final pricing_tensor shape:", pricing_tensor.shape)
    print("📈 Final pricing_tensor dim:", pricing_tensor.dim())

    if len(report_embedding) == 0:
        report_embedding = [0.0] * 128  # default embedding length

    print("🧪 Report embedding length:", len(report_embedding))
    print("🧪 Sample embedding values:", report_embedding[:5])

    report_tensor = torch.tensor(report_embedding, dtype=torch.float32)
    print("📦 Initial report_tensor shape:", report_tensor.shape)
    print("📦 Initial report_tensor dim:", report_tensor.dim())

    if report_tensor.dim() == 1:
        report_tensor = report_tensor.view(1, 1, -1)
    elif report_tensor.dim() == 2:
        report_tensor = report_tensor.view(1, report_tensor.shape[0], report_tensor.shape[1])
    
    print("🧱 Reshaped report_tensor shape:", report_tensor.shape)
    print("🧱 Reshaped report_tensor dim:", report_tensor.dim())

    # Already handled above; no further reshape needed

    seq_len = pricing_tensor.shape[1] if pricing_tensor.dim() >= 2 else 1
    report_tensor = report_tensor.expand(-1, seq_len, -1)  # match sequence length

    print("📦 Report embedding shape:", len(report_embedding))
    print("📦 Report tensor shape:", report_tensor.shape)
    print("📦 Pricing tensor shape:", pricing_tensor.shape)

    # 🔨 Project report embedding to match model's expected input size
    expected_input_size = model.lstm.input_size
    pricing_feature_count = pricing_tensor.shape[2]
    target_report_dim = expected_input_size - pricing_feature_count
    current_report_dim = report_tensor.shape[2]
    if current_report_dim != target_report_dim:
        print(f"🔄 Projecting report embedding from {current_report_dim} to {target_report_dim}")
        proj = nn.Linear(current_report_dim, target_report_dim)
        # apply projection across the final dimension
        # report_tensor: [batch, seq_len, current_report_dim]
        report_tensor = proj(report_tensor)
        print("🔄 Post-projection report_tensor shape:", report_tensor.shape)

    print("🔄 Concatenating tensors...")
    print("🔄 Final report_tensor shape:", report_tensor.shape)
    print("🔄 Final pricing_tensor shape:", pricing_tensor.shape)

    if pricing_tensor.dim() == 3 and report_tensor.dim() == 3:
        input_tensor = torch.cat([pricing_tensor, report_tensor], dim=2)
    else:
        print("❌ Tensor dimension mismatch: cannot concatenate")
        return { "error": "Tensor dimension mismatch" }

    with torch.no_grad():
        output = model(input_tensor)
        if isinstance(output, tuple):
            reg_output = output[0].item()
            cls_output = output[1].argmax().item()
            return { "return": reg_output, "direction": cls_output }
        else:
            return { "return": output.item() }