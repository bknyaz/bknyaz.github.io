---
layout: distill
title: "MetaMerge: Model Merging with Meta Networks"
description: Merging ViTs and LLMs using a pretrained (graph) neural net.
tags: nino merging gnn neural-graphs empirical-study research
giscus_comments: false
date: 2026-02-19
featured: true
mermaid:
  enabled: false
  zoomable: false
code_diff: false
map: false
chart:
  chartjs: false
  echarts: false
  vega_lite: false
  plotly: true
tikzjax: false
typograms: false
related_publications: true
citation: false

authors:
  - name: "Boris Knyazev & Albert M. Orozco Camacho"

bibliography: refs.bib

# Optionally, you can add a table of contents to your post.
# NOTES:
#   - make sure that TOC names match the actual section names
#     for hyperlinks within the post to work correctly.
#   - we may want to automate TOC generation in the future using
#     jekyll-toc plugin (https://github.com/toshimaru/jekyll-toc).
toc:
  - name: Simple Merge
  - name: MetaMerge
    subsections:
      - name: NiNo
      - name: NiNo for Merging
  - name: Experiments
    subsections:
      - name: ViT
      - name: Qwen3
  - name: Visualization of MetaMerge
  - name: Conclusion
  - name: Citation
  - name: Footnotes
  - name: References
---

<script src="https://d3js.org/d3.v7.min.js"></script>
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>


In AI, the dominant approach to develop neural nets is to first pretrain a large model on a big general dataset and then fine-tune it on specific tasks.
In vision, there are, for example, Vision Transformers (ViTs) pretrained on ImageNet and fine-tuned on downstream tasks (e.g., classification of satellite images, textures, etc.).
In language modeling, there are, for example, large language models (LLMs) specialized in [Math](https://huggingface.co/bknyaz/Qwen3-0.6B-Math), [Coding](https://huggingface.co/bknyaz/Qwen3-0.6B-Code) or specific languages (e.g., [French](https://huggingface.co/bknyaz/Qwen3-0.6B-Fr)).
Even though the original pretrained model can also perform well on many tasks, 
**fine-tuning remains essential to achieve optimal performance**<d-footnote>Training-free adaptation methods such as in-context learning, 
prompt tuning and others often show competitive results on some tasks and are less costly. 
However, direct fine-tuning of model parameters is often more effective and applicable to a wider range of tasks, 
especially when a lot of domain knowledge is necessary requiring a lot of parameter updates (e.g., some medical tasks or rare languages).</d-footnote>.
As a result, **there are hundreds or thousands of models fine-tuned for various tasks.**

As AI tackles increasingly more tasks, **fine-tuning costs and storage requirements add up**.
Consider a situation when we first collected a lot of Math data and fine-tuned an LLM on it, 
then some other lab released a model excelling at Code and another lab released a model excelling at French.
First of all, we now have tripled the number of models to store and maintain.
Secondly, despite having three models, we cannot effectively solve mixed tasks such as a Math task in French, 
since there may be no **single** model trained on such a mixture. 
To solve the issues in this example, 
we can collect a desired mix of data and fine-tune the model on it, 
but this is costly and time-consuming especially if we need to change the mixing ratio. 
We can also build some smart ensemble with routing conditioned on the input, 
but doing this effectively is not trivial and still requires some training of the router and storing an entire ensemble<d-cite key="sukhbaatar2024branch,zhou2025mergeme"></d-cite>. 

**Model merging** is a recent **training-free** approach to combine multiple models into one.
As many papers and our experiments show, 
model merging can mitigate limitations of naive fine-tuning 
in a simple yet effective way<d-cite key="wortsman2022model,ilharco2023editing,yadav2023ties"></d-cite>. 
**Surprisingly, the resulting merged models perform well on individual tasks 
and on the mixed tasks they often approach fine-tuning performance, 
but without any training or data collection.**

In this post, we introduce a new model merging method called **MetaMerge**.

> MetaMerge uses a pretrained graph neural network (GNN), that takes weights of multiple models as input
and produces the weights for a single merged model as output without any training or finetuning.

Before introducing MetaMerge and why it is called "Meta", 
let us briefly describe a common baseline approach and several key concepts.

## TL;DR
- We introduce MetaMerge, a new model merging method that uses a pretrained graph neural network (GNN).
- The "Meta" in MetaMerge comes from the fact that both input and output of the pretrained GNN are model weights.
- MetaMerge does not require any training/finetuning.
- MetaMerge can be competitive to weight averaging in some cases even though the metamodel (GNN) was not trained for merging, and more critically, 
the specific model we use for MetaMerge only observed tiny GPT2 style transformers (with <=1.6M parameters) during training.

## Simple Merge

In general, model merging can be defined as some aggregation function $f$ that takes weights of $N$ models as input and produces the weights of a single merged model as output:

$$
\mathbf{W}_{\text{merged}} = f \big( \mathbf{W}_1, \mathbf{W}_2, \ldots, \mathbf{W}_N \big),
$$

where $$ \mathbf{W}_1, \mathbf{W}_2, \ldots, \mathbf{W}_N $$ are the weights of the individual models, 
and $$ \mathbf{W}_{\text{merged}} $$ are the weights of the merged model.

Most of the merging methods implement $f$ directly in the weight space.
For example, the simplest way to merge models is to average their weights:

$$
\mathbf{W}_{\text{merged}} = \frac{1}{N} \sum_{i=1}^{N} \mathbf{W}_i.
$$

More advanced methods include task arithmetic<d-cite key="ilharco2023editing"></d-cite>, 
ties-merge<d-cite key="yadav2023ties"></d-cite>, and others<d-footnote>Tools like https://github.com/arcee-ai/mergekit implement many merging methods.</d-footnote>.
The averaging method works well only when the models are trained from the same initialization, usually from the same pretrained model.
And if they are trained for too long, the performance of the merged model can degrade significantly<d-cite key="frankle2020linear"></d-cite>.
In case of **different** initializations or fine-tuning for too long, merging is still possible by using neuron alignment<d-cite key="ainsworth2022git"></d-cite> and other techniques<d-cite key="stoica2024zipit"></d-cite>,
but this is out of scope of this post.


## Meta Networks

The key concept of MetaMerge is **Meta Networks**<d-cite key="lim2024graph,kofinas2024graph"></d-cite>.
A high level idea of **Meta Networks** is to have a learnable model that can take weights of other models as input to produce some representation or modified weights as output. 
Hence, the term "Meta" is used.
While most merging methods implement $f$ in the weight space directly, 
some recent methods implement $f$ in the low-dimensional space produced by singular value decomposition (SVD)<d-cite key="stoica2025model,gargiulo2025task"></d-cite>.
MetaMerge can be viewed as a more general weight-space transformation learned by a meta-network.

### NiNo

Among various meta networks, we focus on [NiNo](https://bknyaz.github.io/blog/2025/nino/)<d-cite key="knyazev2024accelerating"></d-cite>.
To the best of our knowledge, a pretrained NiNo checkpoint is the only meta network that can potentially be used for merging models in a realistic setup out-of-the-box, since it can both encode and decode models and it supports diverse architectures, including modern transformers.
NiNo is a meta network that was trained to accelerate training. It takes past $c$ checkpoints as input and predicts future (at step $t+K$) parameters as:

$$
W_{t+K} = \text{NiNo}([W_{t-c+1}, \ldots, W_t])
$$

This step is applied every 1,000 steps, while Adam or SGD is used for the rest of the steps.
So, the original NiNo that we are going to use is not trained for any model merging objective, but for accelerating training.
However, it does not mean it cannot be used for merging as we show.

### NiNo for Merging

The only challenge when adapting NiNo to the merging setup is the preparation of the input. 
Specifically, in the equation above NiNo expects $c$ input models in the order corresponding to an optimization trajectory 
(where $c=5$ in pretrained NiNo models). 
One straightforward way to address this issue is to create the "trajectory" as `[pretrained model, model fine-tuned for task 1, model fine-tuned for task 2, ...]`. 
Since tasks do not have a particular order and there may be fewer/more than $c$ tasks, we need certain heuristics. 
Specifically, for the setup with two tasks, we found the following heuristic to work well in practice:

$$
W_{\text{merged}} = \text{NiNo}([W_0, W_{\text{task1}},W_{\text{task2}},W_{\text{task2}},W_{\text{task1}}]).
$$

For the setup with four tasks, the equation is more straightforward since we have exactly 5 models to feed into NiNo:

$$
W_{\text{merged}} = \text{NiNo}([W_0, W_{\text{task1}},W_{\text{task2}},W_{\text{task3}},W_{\text{task4}}]).
$$

In principle, the order of the tasks can be optimized, but we fixed it after some trial and error.

## Experiments

We evaluate MetaMerge on two vision and two language setups.
For vision, we use ViT-B-16 pretrained on ImageNet and fine-tuned on the DTD, RESISC45, MNIST and SVHN datasets.
This is a subset from standard 8 tasks used in model merging papers<d-cite key="ilharco2023editing"></d-cite>.
For language, we created a similar setup by fine-tuning Qwen3-0.6 and Qwen3-1.7B models
on the GSM8K and French datasets<d-footnote>We also released Qwen3-4B models fine-tuned on these datasets and models fine-tuned on the code dataset.</d-footnote>.

### ViT

For ViT-B-16, we use Task Arithmetic code and their checkpoints for evaluation, 
which contains trained classification heads for all the task, so merging is done only for the backbone<d-footnote>Combining classification heads with different backbones in the Task Vectors code allows for flexible evaluation (e.g., a model fine-tuned on task B can be evaluated on task A by attaching a respective head).</d-footnote>.
We run experiments for 2 and 4 tasks. "N models" in Tables denote the number of models required to obtain the results in a given row.
For example, "Finetuned (per task)" requires a fine-tuned model for each task, 
which is often considered as an upper bound for merging methods.
The code to merge ViTs using MetaMerge is provided at [merge_vit.py](https://github.com/SamsungSAILMontreal/nino/blob/main/merge_vit.py).

**Table 1. Results using ViT-B-16 on 2 tasks.**

| Model                          | N models | DTD   | RESISC45 | Avg   |
|--------------------------------|----------|-------|----------|-------|
| Zero Shot (pretrained)         | 1        | 44.68 | 66.38    | 55.53 |
| Finetuned DTD                  | 1        | 82.07 | 50.54    | 66.31 |
| Finetuned RESISC45             | 1        | 36.44 | 96.89    | 66.67 |
| Finetuned (per task)           | 2        | 82.07 | 96.89    | 89.48 |
| Merged Model (avg merge)       | 1        | 72.66 | 94.13    | 83.39 |
| Merged Model (meta merge, mlp) | 1        | 78.99 | 90.43    | 84.71 |
| Merged Model (meta merge)      | 1        | 76.76 | 91.60    | 84.18 |


**Table 2. Results using ViT-B-16 on 4 tasks.**

| Model                          | N models | DTD   | RESISC45 | MNIST   | SVHN    | Avg   |
|--------------------------------|----------|-------|----------|---------|---------|-------|
| Zero Shot (pretrained)         | 1        | 44.68 | 66.38    | 51.73   | 51.99   | 53.70 |
| Finetuned (per task)           | 4        | 82.07 | 96.89    | 99.76   | 97.86   | 94.15 |
| Merged Model (avg merge)       | 1        | 57.18 | 84.06    | 98.55   | 87.28   | 81.77 |
| Merged Model (meta merge, mlp) | 1        | 30.90 | 30.90    | 98.72   | 97.60   | 62.44 |
| Merged Model (meta merge)      | 1        | 46.54 | 78.46    | 98.43   | 96.23   | 79.92 |

Surprisingly, on 2 tasks (Table 1) the ablated NiNo variant (without the GNN part) actually outperforms the full NiNo even though the full one excelled at accelerating training as shown in the NiNo paper's ablations.
One logical explanation is that merging is quite different from predicting future parameters, so good results on merging are not expected in the first place.
Also, the MLP version of NiNo has a simplicity inductive bias so its predictions can be more generic (kind of trend prediction which may be closer to weight averaging) 
and less overfitted to the training objective of accelerating training.
On 4 tasks (Table 2), the ablated variant performs much worse.
In future work, it would be interesting to push NiNo's performance specifically for merging, however, 
defining a proper objective for that is not trivial.

Below we visualize detailed results from Table 2 for all the tasks and models. 

<div id="model-comparison-chart" style="width: 100%; height: 700px;"></div>
<div class="caption" style="text-align: center; margin-top: -35px; margin-bottom: 25px;">
    Model Performance Across Datasets. Comparing accuracy across DTD, RESISC45, MNIST, and SVHN datasets.
</div>

<script src="/assets/js/metamerge/radar-plot.js"></script>


### Qwen3

In the language setup, we first fine-tuned base Qwen3 models 
on the train split of [GSM8K](https://huggingface.co/datasets/openai/gsm8k) and the subset of [luth-sft](https://huggingface.co/datasets/kurakurai/luth-sft).
These are Math and French datasets, respectively.
We chose to fine-tune our own models instead of using existing checkpoints to have a more controlled consistent setup for different model sizes<d-footnote>Our fine-tuning is likely to be far from compute and performance efficient, but our goal is not to provide SOTA models.</d-footnote>.
Then we evaluate on the test split of GSM8K, 
[FrenchBench](https://github.com/EleutherAI/lm-evaluation-harness/tree/main/lm_eval/tasks/french_bench) and 
[GSM8K-Fr](https://huggingface.co/datasets/cmh/gsm8k_fr) (GSM8K translated to French).
See details about the evaluation pipeline and model checkpoints at 🤗[SamsungSAILMontreal/qwen3-small](https://huggingface.co/collections/SamsungSAILMontreal/qwen3-small).
We report Qwen3-0.6B and Qwen3-1.7B results in Tables 3 and 4, respectively. However, we also have Qwen3-4B results and checkpoints on the provided link.

In Qwen3 experiments, we do not have a model fine-tuned on GSM8K-Fr to showcase a common scenario when a training dataset for the mixed task is unavailable, which is prevailing for rare mixes.
Therefore, Qwen3 (fine-tuned per task) only contains two models.
Models with "Math-Fr" in their name are obtained by merging the Math and French models using either simple averaging or MetaMerge.
The code to merge Qwen models using MetaMerge is provided at [merge_qwen.py](https://github.com/SamsungSAILMontreal/nino/blob/main/merge_qwen.py).

**Table 3. Results using Qwen3-0.6B on 3 tasks.**

| Model                                | N models | GSM8K | French | GSM8K-Fr | avg  |
|--------------------------------------|----------|-------|--------|----------|------|
| Qwen3-0.6B                           | 1        | 21.0  | 24.4   | 19.6     | 21.7 |
| Qwen3-0.6B-Math                      | 1        | 46.3  | 25.4   | 29.2     | 33.6 |
| Qwen3-0.6B-Fr                        | 1        | 36.1  | 26.5   | 26.5     | 29.7 |
| Qwen3-0.6B (fine-tuned per task)     | 2        | 46.3  | 26.5   | 26.5     | 33.1 |
| Qwen3-0.6B-Math-Fr (avg merge)       | 1        | 48.4  | 27.4   | 33.9     | 36.6 |
| Qwen3-0.6B-Math-Fr (meta merge, mlp) | 1        | 47.8  | 25.8   | 30.9     | 34.8 |
| Qwen3-0.6B-Math-Fr (meta merge)      | 1        | 45.1  | 25.7   | 31.6     | 34.1 |

**Table 4. Results using Qwen3-1.7B on 3 tasks.**

| Model                                | N models | GSM8K | French | GSM8K-Fr | avg  |
|--------------------------------------|----------|-------|--------|----------|------|
| Qwen3-1.7B                           | 1        | 20.6  | 26.2   | 20.2     | 22.3 |
| Qwen3-1.7B-Math                      | 1        | 62.1  | 28.3   | 41.5     | 43.9 |
| Qwen3-1.7B-Fr                        | 1        | 60.9  | 32.8   | 43.9     | 45.9 |
| Qwen3-1.7B (fine-tuned per task)     | 2        | 62.1  | 32.8   | 43.9     | 46.3 |
| Qwen3-1.7B-Math-Fr (avg merge)       | 1        | 64.0  | 31.4   | 46.9     | 47.4 |
| Qwen3-1.7B-Math-Fr (meta merge, mlp) | 1        | 63.0  | 28.3   | 43.8     | 45.0 |
| Qwen3-1.7B-Math-Fr (meta merge)      | 1        | 62.7  | 28.4   | 43.2     | 44.8 |

For Qwen3-0.6B, the simple averaging method outperforms MetaMerge and as in ViT (on 2 tasks), 
the MLP version of NiNo outperforms the full NiNo. 
One possible explanation is that the pretrained NiNo has only seen tiny GPT2 style transformers (with <=1.6M parameters) during training.
So making predictions for a Qwen architecture with 600M parameters is an extreme out-of-distribution scenario for NiNo.
As in ViT experiments, the MLP version of NiNo performs slightly better than the full model potentially due to its simplicity inductive bias.
Qwen3-1.7B is even a more severe out-of-distribution scenario for NiNo, so it is not surprising that MetaMerge does not perform as well as simple averaging.
Despite the average benchmark scores being worse or comparable, 
an interesting question for future studies is whether MetaMerge produces functionally different models than simple averaging or the ablated NiNo variant.


## Visualization of MetaMerge

In this demo, we compare weight averaging to MetaMerge on ViT using 4 tasks.
We sampled 100 weight positions per layer (same positions for all models) to enable efficient visualization.
For each position, parameters are ordered in the way we pass them to NiNo (i.e., pretrained, dtd, resisc45, mnist, svhn). 
Since NiNo was trained to predict future parameters, we show a MetaMerge prediction as the last point on the trajectory.
The weight averaging baseline is shown as a horizontal line for comparison.

<div id="weight-explorer" data-weights-file="/assets/data/network_weights.csv">
  <div class="controls" style="margin-bottom: 1.5rem;">
    <div class="slider-group">
      <div>
        <label for="layer-slider">Layer:</label>
        <div class="slider-container layer-slider-container">
          <input type="range" id="layer-slider" class="slider" min="0" max="0" value="0">
          <span id="layer-value" class="slider-value">-</span>
        </div>
      </div>
      <div>
        <label for="neuron-slider">Weight:</label>
        <div class="slider-container neuron-slider-container">
          <input type="range" id="neuron-slider" class="slider" min="0" max="0" value="0">
          <span id="neuron-value" class="slider-value">-</span>
        </div>
      </div>
    </div>
  </div>
  <div id="weight-plot"></div>
  <div id="legend" class="chart-legend"></div>
</div>

<script src="/assets/js/metamerge/weight-explorer.js"></script>

MetaMerge is used for all layers in the visual backbone (starting with "visual.") 
except for conv1 as explained in our [merge_vit.py](https://github.com/SamsungSAILMontreal/nino/blob/main/merge_vit.py) code and layers 
not starting with "visual.". For those we use weight averaging, so in the visualization the "meta-merge" point is the same as the "average" in such cases.
Overall, the visualization shows that there is no simple relationship between the input models and the MetaMerge prediction.
But the visualization may give some insights on problematic behavior (e.g., for biases the MetaMerge predictions tend to be too far from the overall trajectory).

## Conclusion

- MetaMerge shows competitive performance to weight averaging in some experiments even though the metamodel (GNN) was not trained for merging.
- In some cases, MetaMerge underperforms like due to the distribution shifts and a different objective. So we believe there is a lot of potential for improving MetaMerge by training a metamodel with an objective more aligned with merging.
- Besides introducing MetaMerge, we also released fine-tuned and merged Qwen3 models obtained in a controllable way that could be used for merging experiments.

### License

Diagrams and text are licensed under Creative Commons Attribution [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/), 
unless noted otherwise. 

### Citation

```bibtex
@misc{knyazev2026metamerge,
  title={MetaMerge: Model Merging with Meta Networks},
  author={Boris Knyazev and Albert M. Orozco Camacho},
  year={2026},
  url={https://bknyaz.github.io/blog/2026/metamerge/}
}
```