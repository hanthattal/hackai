import torch
import os
import numpy as np
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

    # Construct input tensor [1, seq_len, features]
    pricing_tensor = torch.tensor([pricing_data], dtype=torch.float32)  # [1, seq_len, features]

    if len(report_embedding) == 0:
        report_embedding = [0.0] * 128  # default embedding length

    report_tensor = torch.tensor(report_embedding, dtype=torch.float32).unsqueeze(0).unsqueeze(1)  # [1, 1, features]
    report_tensor = report_tensor.expand(-1, pricing_tensor.shape[1], -1)  # match sequence length
    input_tensor = torch.cat([pricing_tensor, report_tensor], dim=2)  # concat on features

    with torch.no_grad():
        output = model(input_tensor)
        if isinstance(output, tuple):
            reg_output = output[0].item()
            cls_output = output[1].argmax().item()
            return { "return": reg_output, "direction": cls_output }
        else:
            return { "return": output.item() }