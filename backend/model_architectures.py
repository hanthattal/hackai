import torch.nn as nn

class LSTMRegressor(nn.Module):
    def __init__(self, input_size):
        super().__init__()
        self.lstm = nn.LSTM(input_size, 32, 1, batch_first=True)
        self.fc = nn.Linear(32, 1)

    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])

class MultiTaskLSTM(nn.Module):
    def __init__(self, input_size, hidden_size=64):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True)
        self.fc_reg = nn.Linear(hidden_size, 1)
        self.fc_cls = nn.Linear(hidden_size, 3)

    def forward(self, x):
        out, _ = self.lstm(x)
        last = out[:, -1, :]
        return self.fc_reg(last), self.fc_cls(last)

def get_model(strategy: str):
    if strategy == "trading":
        return MultiTaskLSTM(input_size=18, hidden_size=32)
    elif strategy in ["short", "long"]:
        return LSTMRegressor(input_size=26)
    else:
        raise ValueError(f"Unknown strategy: {strategy}")
