---
layout: post
title: "Data Metric Description"
categories: Data_Analysis pandas
---

数据描述度量


```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
```


```python
arr = np.random.randint(1,100,size =100)
data = pd.Series(arr)
```


```python
data.std()
```




    27.34981918334961




```python
data.describe()
```




    count    100.000000
    mean      43.740000
    std       27.349819
    min        1.000000
    25%       20.750000
    50%       43.000000
    75%       62.250000
    max       98.000000
    dtype: float64




```python
data.mean()
```




    43.74




```python
db = data.std()/data.mean()
db
```




    0.6252816457098676




```python
dd = pd.value_counts(data)
dd = dd.sort_index()
```


```python
plt.plot(dd.index, dd.values)
plt.show()
```


![png]({{ '/assets/images/data_metric_description/output_8_0.png' }})


```python
data_z = (data - data.mean())/data.std()
data_z[data_z.values > 1].values[data_z[data_z.values > 1].values < 1.4]
```




    array([ 1.39891236,  1.2526591 ,  1.2526591 ,  1.03327923,  1.39891236,
            1.03327923,  1.21609579])




```python
data.value_counts(ascending=False)
```




    24    6
    44    4
    19    4
    91    3
    40    3
    18    3
    2     3
    39    2
    43    2
    58    2
    26    2
    46    2
    47    2
    49    2
    36    2
    55    2
    1     2
    61    2
    30    2
    86    2
    63    2
    14    2
    13    2
    72    2
    78    2
    82    2
    4     1
    28    1
    5     1
    6     1
         ..
    8     1
    31    1
    9     1
    21    1
    20    1
    11    1
    25    1
    98    1
    34    1
    35    1
    94    1
    93    1
    92    1
    89    1
    87    1
    83    1
    77    1
    68    1
    66    1
    64    1
    62    1
    57    1
    56    1
    54    1
    51    1
    50    1
    48    1
    97    1
    37    1
    45    1
    dtype: int64




```python
data_z
```




    0     1.398912
    1    -1.526153
    2     0.521393
    3    -0.502380
    4    -1.562716
    5    -1.526153
    6     0.448266
    7     1.983925
    8     0.631083
    9    -1.526153
    10   -0.941140
    11    0.009506
    12    0.704209
    13   -0.502380
    14   -1.087393
    15    1.764545
    16    0.631083
    17   -0.575507
    18   -0.356127
    19    0.484830
    20    1.654856
    21   -0.136747
    22    0.228886
    23    1.581729
    24   -0.136747
    25   -0.831450
    26   -1.416463
    27   -0.283000
    28   -0.721760
    29   -0.685196
            ...   
    70    0.813899
    71    1.727982
    72   -0.904576
    73    0.046070
    74    0.119196
    75   -1.562716
    76    0.009506
    77   -0.319563
    78    1.435476
    79   -0.173310
    80    1.727982
    81    0.704209
    82   -0.027057
    83   -1.087393
    84    0.009506
    85   -0.904576
    86    0.082633
    87    0.667646
    88   -0.721760
    89    1.033279
    90   -0.246437
    91    0.887026
    92    1.837672
    93    1.216096
    94   -0.941140
    95    0.009506
    96   -1.379899
    97   -1.123956
    98   -1.197083
    99    0.082633
    dtype: float64




```python
factor = pd.cut(data_z, [1, 1.5])
factor
```




    0     (1, 1.5]
    1          NaN
    2          NaN
    3          NaN
    4          NaN
    5          NaN
    6          NaN
    7          NaN
    8          NaN
    9          NaN
    10         NaN
    11         NaN
    12         NaN
    13         NaN
    14         NaN
    15         NaN
    16         NaN
    17         NaN
    18         NaN
    19         NaN
    20         NaN
    21         NaN
    22         NaN
    23         NaN
    24         NaN
    25         NaN
    26         NaN
    27         NaN
    28         NaN
    29         NaN
            ...   
    70         NaN
    71         NaN
    72         NaN
    73         NaN
    74         NaN
    75         NaN
    76         NaN
    77         NaN
    78    (1, 1.5]
    79         NaN
    80         NaN
    81         NaN
    82         NaN
    83         NaN
    84         NaN
    85         NaN
    86         NaN
    87         NaN
    88         NaN
    89    (1, 1.5]
    90         NaN
    91         NaN
    92         NaN
    93    (1, 1.5]
    94         NaN
    95         NaN
    96         NaN
    97         NaN
    98         NaN
    99         NaN
    dtype: category
    Categories (1, object): [(1, 1.5]]




```python
pd.value_counts(factor)
```


```python
data.var()
```


```python
data[data.values < 20]
data.mode()
```


```python
pd.value_counts(data)
```


```python
data_z[factor == "(1, 1.5]"]
```




    0     1.398912
    30    1.252659
    53    1.252659
    58    1.033279
    66    1.398912
    78    1.435476
    89    1.033279
    93    1.216096
    dtype: float64
