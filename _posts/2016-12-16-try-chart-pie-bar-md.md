---
layout: post
title:  "Welcome"
date:   2016-12-16 22:11:45 +0800
categories: jekyll update
---
# Pie Chart and Pareto Chart Exercise


```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

```


```python
data = pd.DataFrame([12,34,56,89],index=['A','B','C','D'])
```


```python
data = pd.DataFrame([12,34,56,89],index=['A','B','C','D'])

data
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>0</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>A</th>
      <td>12</td>
    </tr>
    <tr>
      <th>B</th>
      <td>34</td>
    </tr>
    <tr>
      <th>C</th>
      <td>56</td>
    </tr>
    <tr>
      <th>D</th>
      <td>89</td>
    </tr>
  </tbody>
</table>
</div>




```python
data.T
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>A</th>
      <th>B</th>
      <th>C</th>
      <th>D</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>12</td>
      <td>34</td>
      <td>56</td>
      <td>89</td>
    </tr>
  </tbody>
</table>
</div>




```python
sortedData = data.sort_values(by=0,ascending=False)

sortedData
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>0</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>D</th>
      <td>89</td>
    </tr>
    <tr>
      <th>C</th>
      <td>56</td>
    </tr>
    <tr>
      <th>B</th>
      <td>34</td>
    </tr>
    <tr>
      <th>A</th>
      <td>12</td>
    </tr>
  </tbody>
</table>
</div>




```python
explode = [0,0.1,0.2,0.3]
colors = ['lime','aqua','lightslategrey','khaki']

plt.pie(sortedData.values,\
              explode=explode,\
              labels=sortedData.index,\
              colors=colors, autopct='%1.1f%%',\
              pctdistance = 0.6,\
              shadow = True, startangle = 90)
#plt.axis('equal')
plt.figure(figsize=(10,9))
plt.show()
```


![png](output_6_0.png)



    <matplotlib.figure.Figure at 0xad3ea90>



```python
plt.bar(np.arange(4),sortedData.values,width=0.35, color='aqua', alpha=0.4,align='center')
plt.xticks(np.arange(4),['A','B','C','D'])
plt.plot(sortedData.cumsum().values)
plt.title("pareto chart")
plt.twinx()
plt.show()
```


![png](output_7_0.png)



```python

```
