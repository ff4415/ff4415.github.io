---
layout: post
title:  "两个风险资产的投资组合"
date:   2017-02-10 20:16:45 +0800
categories: python  quant
cover: '/assets/images/47152268_p0.jpg'
---

`python`  `量化投资`

-------------------

# 两个风险资产的投资组合


```python
import numpy as np
import pandas as pd
from pandas import Series, DataFrame
import matplotlib.pyplot as plt
```


```python
instruments(['002052.XSHE', '000520.XSHE'])
```




    [Instrument(industry_name='计算机、通信和其他电子设备制造业', symbol='同洲电子', sector_code='InformationTechnology', concept_names='卫星导航|三网融合|体育概念|业绩预升|新三板', status='Active', order_book_id='002052.XSHE', sector_code_name='信息技术', type='CS', special_type='Normal', abbrev_symbol='TZDZ', de_listed_date='0000-00-00', exchange='XSHE', round_lot=100.0, listed_date='2006-06-27', industry_code='C39', board_type='UNKNOWN'),
     Instrument(industry_name='水上运输业', symbol='长航凤凰', sector_code='Industrials', concept_names='准ST股|整体上市', status='Active', order_book_id='000520.XSHE', sector_code_name='工业', type='CS', special_type='Normal', abbrev_symbol='CHFH', de_listed_date='0000-00-00', exchange='XSHE', round_lot=100.0, listed_date='1993-10-25', industry_code='G55', board_type='MainBoard')]




```python
chins = ['002052.XSHE', '000520.XSHE']
len_c = len(chins)
gp = get_price(chins, frequency='1d', start_date='20160124',end_date='20170126', fields='close')
```


```python
gp.describe()
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>002052.XSHE</th>
      <th>000520.XSHE</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>count</th>
      <td>247.000000</td>
      <td>247.000000</td>
    </tr>
    <tr>
      <th>mean</th>
      <td>10.746356</td>
      <td>8.580891</td>
    </tr>
    <tr>
      <th>std</th>
      <td>1.100887</td>
      <td>1.263062</td>
    </tr>
    <tr>
      <th>min</th>
      <td>9.230000</td>
      <td>6.640000</td>
    </tr>
    <tr>
      <th>25%</th>
      <td>10.030000</td>
      <td>7.520000</td>
    </tr>
    <tr>
      <th>50%</th>
      <td>10.030000</td>
      <td>8.580000</td>
    </tr>
    <tr>
      <th>75%</th>
      <td>11.780000</td>
      <td>9.260000</td>
    </tr>
    <tr>
      <th>max</th>
      <td>14.460000</td>
      <td>12.980000</td>
    </tr>
  </tbody>
</table>
</div>




```python
for i in range(len_c):
    print(gp.iloc[:,i].head())
```

    2016-01-25    10.03
    2016-01-26    10.03
    2016-01-27    10.03
    2016-01-28    10.03
    2016-01-29    10.03
    Name: 002052.XSHE, dtype: float64
    2016-01-25    10.13
    2016-01-26     9.12
    2016-01-27     9.12
    2016-01-28     8.78
    2016-01-29     9.10
    Name: 000520.XSHE, dtype: float64



```python
for i in range(len_c):
    gpp = gp.iloc[:, i]
    bins = [gpp.min(), gpp.quantile(0.5), gpp.quantile(0.75),gpp.max()]
    print(pd.cut(gpp, bins, right=False).value_counts(normalize=True))
```

    [10.03, 11.78)    0.723577
    [11.78, 14.46)    0.247967
    [9.23, 10.03)     0.028455
    Name: 002052.XSHE, dtype: float64
    [6.64, 8.58)     0.500000
    [9.26, 12.98)    0.256098
    [8.58, 9.26)     0.243902
    Name: 000520.XSHE, dtype: float64



```python
gp.pct_change().tail()
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>002052.XSHE</th>
      <th>000520.XSHE</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>2017-01-20</th>
      <td>0.099678</td>
      <td>0.015915</td>
    </tr>
    <tr>
      <th>2017-01-23</th>
      <td>-0.001949</td>
      <td>0.001305</td>
    </tr>
    <tr>
      <th>2017-01-24</th>
      <td>-0.028320</td>
      <td>-0.016949</td>
    </tr>
    <tr>
      <th>2017-01-25</th>
      <td>0.005025</td>
      <td>-0.002653</td>
    </tr>
    <tr>
      <th>2017-01-26</th>
      <td>-0.007000</td>
      <td>0.010638</td>
    </tr>
  </tbody>
</table>
</div>



## 组合的协方差


```python
gt = gp.cov()
gt
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>002052.XSHE</th>
      <th>000520.XSHE</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>002052.XSHE</th>
      <td>1.211953</td>
      <td>-0.862957</td>
    </tr>
    <tr>
      <th>000520.XSHE</th>
      <td>-0.862957</td>
      <td>1.595325</td>
    </tr>
  </tbody>
</table>
</div>




```python
gt.iloc[: ,:].sum()
```




    002052.XSHE    0.348996
    000520.XSHE    0.732368
    dtype: float64




```python
gt.iloc[: ,:].sum().sum()
```




    1.0813639346960275




```python
eee = [10, 100]
ggt = (gt*eee)
ggt = ggt.T * eee
del eee
ggt.T
ggt
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>002052.XSHE</th>
      <th>000520.XSHE</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>002052.XSHE</th>
      <td>121.195252</td>
      <td>-862.956904</td>
    </tr>
    <tr>
      <th>000520.XSHE</th>
      <td>-862.956904</td>
      <td>15953.252197</td>
    </tr>
  </tbody>
</table>
</div>




```python
sum = ggt.iloc[:,:].sum().sum()
sum
```




    14348.533641420629



## 组合的相关系数


```python
gp.corr()
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>002052.XSHE</th>
      <th>000520.XSHE</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>002052.XSHE</th>
      <td>1.000000</td>
      <td>-0.620614</td>
    </tr>
    <tr>
      <th>000520.XSHE</th>
      <td>-0.620614</td>
      <td>1.000000</td>
    </tr>
  </tbody>
</table>
</div>



## 计算期望收益


```python
erp = []
for i in range(len_c):
    gpv = gp.iloc[:, i].value_counts(normalize=True)
    g1 = gpv.index
    g2 = gpv.values
    erp.append(pd.Series(g1 * g2).sum())
erp
```




    [10.746356275303643, 8.5808906882591085]



## 评估组合权重


```python
# 组合期望收益
erp_total = []
# 组合的方差
var_total = []
# 组合权重
wd_total = []
we_total = []

for i in range(0,10000,1):
        # 投资比例作为组合权重,精确到0.01%
        wd = i/10000
        we = 1 - wd
        erp_total.append(wd*erp[0] + we*erp[1])
        wd_total.append(wd)
        we_total.append(we)
        cov_s = [wd,we]
        ct = gt
        ct = ct * cov_s
        ct = ct.T * cov_s
        ct = ct.T
        sum = ct.iloc[:,:].sum().sum()
        var_total.append(sum)
# print("erp_total = \n", len(erp_total))
print("\nvar_total = \n",len(var_total))
```


    var_total =
     10000



```python
total = pd.DataFrame(columns=['wd','we','erp','var'])
total['wd'] = wd_total
total['we'] = we_total
total['erp'] = erp_total
total['var'] = var_total
total.head()
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>wd</th>
      <th>we</th>
      <th>erp</th>
      <th>var</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>0.0000</td>
      <td>1.0000</td>
      <td>8.580891</td>
      <td>1.595325</td>
    </tr>
    <tr>
      <th>1</th>
      <td>0.0001</td>
      <td>0.9999</td>
      <td>8.581107</td>
      <td>1.594834</td>
    </tr>
    <tr>
      <th>2</th>
      <td>0.0002</td>
      <td>0.9998</td>
      <td>8.581324</td>
      <td>1.594342</td>
    </tr>
    <tr>
      <th>3</th>
      <td>0.0003</td>
      <td>0.9997</td>
      <td>8.581540</td>
      <td>1.593851</td>
    </tr>
    <tr>
      <th>4</th>
      <td>0.0004</td>
      <td>0.9996</td>
      <td>8.581757</td>
      <td>1.593359</td>
    </tr>
  </tbody>
</table>
</div>



## 两个风险资产组合的有效边界


```python
plt.plot(var_total, erp_total)
plt.show()
```


![png]({{ '/assets/images/efficient_frontier_of_two_risky_assets/efficient_frontier_of_risky_assets.png' }})


## 最小方差组合


```python
total[total['var'] < 0.262237].sort_values(by='erp', ascending=False)
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>wd</th>
      <th>we</th>
      <th>erp</th>
      <th>var</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>5428</th>
      <td>0.5428</td>
      <td>0.4572</td>
      <td>9.756305</td>
      <td>0.262237</td>
    </tr>
    <tr>
      <th>5427</th>
      <td>0.5427</td>
      <td>0.4573</td>
      <td>9.756089</td>
      <td>0.262236</td>
    </tr>
    <tr>
      <th>5426</th>
      <td>0.5426</td>
      <td>0.4574</td>
      <td>9.755872</td>
      <td>0.262236</td>
    </tr>
    <tr>
      <th>5425</th>
      <td>0.5425</td>
      <td>0.4575</td>
      <td>9.755656</td>
      <td>0.262236</td>
    </tr>
    <tr>
      <th>5424</th>
      <td>0.5424</td>
      <td>0.4576</td>
      <td>9.755439</td>
      <td>0.262236</td>
    </tr>
    <tr>
      <th>5423</th>
      <td>0.5423</td>
      <td>0.4577</td>
      <td>9.755223</td>
      <td>0.262236</td>
    </tr>
    <tr>
      <th>5422</th>
      <td>0.5422</td>
      <td>0.4578</td>
      <td>9.755006</td>
      <td>0.262236</td>
    </tr>
    <tr>
      <th>5421</th>
      <td>0.5421</td>
      <td>0.4579</td>
      <td>9.754790</td>
      <td>0.262236</td>
    </tr>
    <tr>
      <th>5420</th>
      <td>0.5420</td>
      <td>0.4580</td>
      <td>9.754573</td>
      <td>0.262236</td>
    </tr>
    <tr>
      <th>5419</th>
      <td>0.5419</td>
      <td>0.4581</td>
      <td>9.754356</td>
      <td>0.262236</td>
    </tr>
    <tr>
      <th>5418</th>
      <td>0.5418</td>
      <td>0.4582</td>
      <td>9.754140</td>
      <td>0.262237</td>
    </tr>
  </tbody>
</table>
</div>



最小方差为 0.262236

此时的风险组合权重
wd = 54.27%
we = 45.73%

期望收益为 9.756089%

## 多个资产组合的参数遍历(Ruby)

```ruby
#遍历所有可能的参数组合
#prgs2(a,num,data)
# a：目标参数数组
# num: 参数数量
# data: 参数取值范围
def prgs2(a,num,data)
    data = 0 if data < 0
    if num <= 0 then
        a[0] = data
        p a
        return
    end
    for i in 0..data do
        a[num] = data - i
        prgs2(a,num-1,i)
    end
end

a = Array.new(4,0)
prgs2(a,4,5)

```
