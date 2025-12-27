# Recurrence is All You Need

Recurrent vs recursive?
Recurrent - repeating patterns over time, like time series data or sequences.
Recursive - self-referential structures, like functions that call themselves.

So recursive transformers are not a thing, but recurrent transformers are.
Similarly like recurrent neural networks (RNNs) that process sequences step by step, recurrent transformers are designed to handle sequential data by maintaining a state across time steps.

Describe recurrent transformers (existing papers like Zero-token Transformer, etc.)

Add results of training tiny RT from scratch on some dataset like GSM8K or something small.

Use character level tokenization to reduce the vocabulary size and make it easier to train from scratch.

Show comparison of RTs vs regular transformers on this small dataset.