---
layout: post
title: "深300指数 PB&PE 处于历史最低10% 时买入持有2年的年化收益率"
date:   2018-08-30 03:12:45 +0800
categories: python  quant
cover: '/assets/images/47152268_p0.jpg'
---

`python`  `量化投资`

---

条件：

1. 市盈率（P/E）处于历史最低的10%范围
2. 市净率（P/B）处于历史最低的10%范围
3. 市盈率（P/E）& 市净率（P/B）同时处于历史最低的10%范围

追加条件： **成交量低于2年平均值**

处理：

（选取日收盘价两年后的市值 / 选取日收盘价市值）* 100%


```python
import pandas as pd
```

Ricequant 策略API

index_indicator - 获取指数每日估值指标

文档地址：[index_indicator - 获取指数每日估值指标](https://www.ricequant.com/api/research/chn#research-API-index_indicator)

数据从 2016-01-04 开始. 因为时间太靠近，结束日期放在2017-08-28， 总计404天。正好是一个熊市的起点，所以结果会比较好看.


```python
ii = index_indicator('000300.XSHG', end_date=20170828)
```

- pb: 市净率
- pe_ttm: 市盈率
- trade_date: 交易日


```python
ii.head()
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>order_book_id</th>
      <th>pb</th>
      <th>pe_ttm</th>
      <th>trade_date</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>000300.XSHG</td>
      <td>1.4884</td>
      <td>12.7512</td>
      <td>2016-01-04</td>
    </tr>
    <tr>
      <th>1</th>
      <td>000300.XSHG</td>
      <td>1.4919</td>
      <td>12.7809</td>
      <td>2016-01-05</td>
    </tr>
    <tr>
      <th>2</th>
      <td>000300.XSHG</td>
      <td>1.5200</td>
      <td>13.0217</td>
      <td>2016-01-06</td>
    </tr>
    <tr>
      <th>3</th>
      <td>000300.XSHG</td>
      <td>1.4261</td>
      <td>12.2178</td>
      <td>2016-01-07</td>
    </tr>
    <tr>
      <th>4</th>
      <td>000300.XSHG</td>
      <td>1.4562</td>
      <td>12.4754</td>
      <td>2016-01-08</td>
    </tr>
  </tbody>
</table>
</div>



- count: 统计数量
- mean: 平均值
- std: 标准差
- min: 最小值
- 25%: 25%位数
- 50%: 中位数
- 75%: 3/4位数
- max: 最大值


```python
ii.describe()
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>pb</th>
      <th>pe_ttm</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>count</th>
      <td>404.000000</td>
      <td>404.000000</td>
    </tr>
    <tr>
      <th>mean</th>
      <td>1.338338</td>
      <td>12.753184</td>
    </tr>
    <tr>
      <th>std</th>
      <td>0.054754</td>
      <td>0.874503</td>
    </tr>
    <tr>
      <th>min</th>
      <td>1.222900</td>
      <td>10.645600</td>
    </tr>
    <tr>
      <th>25%</th>
      <td>1.301325</td>
      <td>11.952375</td>
    </tr>
    <tr>
      <th>50%</th>
      <td>1.336650</td>
      <td>12.945000</td>
    </tr>
    <tr>
      <th>75%</th>
      <td>1.375225</td>
      <td>13.455100</td>
    </tr>
    <tr>
      <th>max</th>
      <td>1.520000</td>
      <td>14.518500</td>
    </tr>
  </tbody>
</table>
</div>




```python
# s_pb: Series类型, trade_date作为索引，pb 作为值,累积历史数据用来统计
s_pb = pd.Series()
# s_pe: Series类型, trade_date作为索引，pe_ttm 作为值,累积历史数据用来统计
s_pe = pd.Series()
# selected_pb_date: 数组类型， 存放用 pb洗出来的 trade_date 时间戳
selected_pb_date = []
#  selected_pe_date: 数组类型， 存放用 pe洗出来的 trade_date 时间戳
selected_pe_date = []

# pandas.Series.quantile: pandas API 返回给定分位数
# 文档地址： http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.quantile.html
```


```python
for index, row in ii.iterrows():
    if s_pb.any() and row['pb'] < s_pb.quantile(0.1):
        selected_pb_date.append(row['trade_date'])
    if s_pe.any() and row['pe_ttm'] < s_pe.quantile(0.1):
        selected_pe_date.append(row['trade_date'])
    s_pb = s_pb.append(pd.Series({row['trade_date']: row['pb']}), ignore_index=False)
    s_pe = s_pe.append(pd.Series({row['trade_date']: row['pe_ttm']}), ignore_index=False)
```


```python
selected_pb_date
```




    [Timestamp('2016-01-07 00:00:00'),
     Timestamp('2016-01-11 00:00:00'),
     Timestamp('2016-01-12 00:00:00'),
     Timestamp('2016-01-13 00:00:00'),
     Timestamp('2016-01-15 00:00:00'),
     Timestamp('2016-01-18 00:00:00'),
     Timestamp('2016-01-21 00:00:00'),
     Timestamp('2016-01-22 00:00:00'),
     Timestamp('2016-01-26 00:00:00'),
     Timestamp('2016-01-27 00:00:00'),
     Timestamp('2016-01-28 00:00:00'),
     Timestamp('2016-02-01 00:00:00'),
     Timestamp('2016-02-03 00:00:00'),
     Timestamp('2016-02-15 00:00:00'),
     Timestamp('2016-02-25 00:00:00'),
     Timestamp('2016-02-29 00:00:00'),
     Timestamp('2016-05-06 00:00:00'),
     Timestamp('2016-05-09 00:00:00'),
     Timestamp('2016-05-10 00:00:00'),
     Timestamp('2016-05-11 00:00:00'),
     Timestamp('2016-05-12 00:00:00'),
     Timestamp('2016-05-13 00:00:00'),
     Timestamp('2016-05-16 00:00:00'),
     Timestamp('2016-05-17 00:00:00'),
     Timestamp('2016-05-18 00:00:00'),
     Timestamp('2016-05-19 00:00:00'),
     Timestamp('2016-05-20 00:00:00'),
     Timestamp('2016-05-23 00:00:00'),
     Timestamp('2016-05-24 00:00:00'),
     Timestamp('2016-05-25 00:00:00'),
     Timestamp('2016-05-26 00:00:00'),
     Timestamp('2016-05-27 00:00:00'),
     Timestamp('2016-05-30 00:00:00')]



404个交易日， 用pb洗出33个值。


```python
len(selected_pb_date)
```




    33




```python
selected_pe_date
```




    [Timestamp('2016-01-07 00:00:00'),
     Timestamp('2016-01-11 00:00:00'),
     Timestamp('2016-01-12 00:00:00'),
     Timestamp('2016-01-13 00:00:00'),
     Timestamp('2016-01-15 00:00:00'),
     Timestamp('2016-01-18 00:00:00'),
     Timestamp('2016-01-21 00:00:00'),
     Timestamp('2016-01-22 00:00:00'),
     Timestamp('2016-01-26 00:00:00'),
     Timestamp('2016-01-27 00:00:00'),
     Timestamp('2016-01-28 00:00:00'),
     Timestamp('2016-02-01 00:00:00'),
     Timestamp('2016-02-03 00:00:00'),
     Timestamp('2016-02-15 00:00:00'),
     Timestamp('2016-02-25 00:00:00'),
     Timestamp('2016-02-29 00:00:00')]



404个交易日， 用pe洗出16个值。


```python
len(selected_pe_date)
```




    16



交易日和它的 pb 及 pe 值


```python
# pb
ii_pb = ii.loc[ii['trade_date'].isin(selected_pb_date)];ii_pb
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>order_book_id</th>
      <th>pb</th>
      <th>pe_ttm</th>
      <th>trade_date</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>3</th>
      <td>000300.XSHG</td>
      <td>1.4261</td>
      <td>12.2178</td>
      <td>2016-01-07</td>
    </tr>
    <tr>
      <th>5</th>
      <td>000300.XSHG</td>
      <td>1.3884</td>
      <td>11.8948</td>
      <td>2016-01-11</td>
    </tr>
    <tr>
      <th>6</th>
      <td>000300.XSHG</td>
      <td>1.3972</td>
      <td>11.9698</td>
      <td>2016-01-12</td>
    </tr>
    <tr>
      <th>7</th>
      <td>000300.XSHG</td>
      <td>1.3723</td>
      <td>11.7569</td>
      <td>2016-01-13</td>
    </tr>
    <tr>
      <th>9</th>
      <td>000300.XSHG</td>
      <td>1.3496</td>
      <td>11.5620</td>
      <td>2016-01-15</td>
    </tr>
    <tr>
      <th>10</th>
      <td>000300.XSHG</td>
      <td>1.3506</td>
      <td>11.5709</td>
      <td>2016-01-18</td>
    </tr>
    <tr>
      <th>13</th>
      <td>000300.XSHG</td>
      <td>1.3357</td>
      <td>11.4432</td>
      <td>2016-01-21</td>
    </tr>
    <tr>
      <th>14</th>
      <td>000300.XSHG</td>
      <td>1.3488</td>
      <td>11.5549</td>
      <td>2016-01-22</td>
    </tr>
    <tr>
      <th>16</th>
      <td>000300.XSHG</td>
      <td>1.2748</td>
      <td>10.9212</td>
      <td>2016-01-26</td>
    </tr>
    <tr>
      <th>17</th>
      <td>000300.XSHG</td>
      <td>1.2718</td>
      <td>10.8956</td>
      <td>2016-01-27</td>
    </tr>
    <tr>
      <th>18</th>
      <td>000300.XSHG</td>
      <td>1.2426</td>
      <td>10.6456</td>
      <td>2016-01-28</td>
    </tr>
    <tr>
      <th>20</th>
      <td>000300.XSHG</td>
      <td>1.2558</td>
      <td>10.7581</td>
      <td>2016-02-01</td>
    </tr>
    <tr>
      <th>22</th>
      <td>000300.XSHG</td>
      <td>1.2700</td>
      <td>10.8805</td>
      <td>2016-02-03</td>
    </tr>
    <tr>
      <th>25</th>
      <td>000300.XSHG</td>
      <td>1.2664</td>
      <td>10.8501</td>
      <td>2016-02-15</td>
    </tr>
    <tr>
      <th>33</th>
      <td>000300.XSHG</td>
      <td>1.2581</td>
      <td>10.7789</td>
      <td>2016-02-25</td>
    </tr>
    <tr>
      <th>35</th>
      <td>000300.XSHG</td>
      <td>1.2479</td>
      <td>10.6908</td>
      <td>2016-02-29</td>
    </tr>
    <tr>
      <th>82</th>
      <td>000300.XSHG</td>
      <td>1.2488</td>
      <td>11.7747</td>
      <td>2016-05-06</td>
    </tr>
    <tr>
      <th>83</th>
      <td>000300.XSHG</td>
      <td>1.2231</td>
      <td>11.5321</td>
      <td>2016-05-09</td>
    </tr>
    <tr>
      <th>84</th>
      <td>000300.XSHG</td>
      <td>1.2245</td>
      <td>11.5460</td>
      <td>2016-05-10</td>
    </tr>
    <tr>
      <th>85</th>
      <td>000300.XSHG</td>
      <td>1.2306</td>
      <td>11.6028</td>
      <td>2016-05-11</td>
    </tr>
    <tr>
      <th>86</th>
      <td>000300.XSHG</td>
      <td>1.2321</td>
      <td>11.6173</td>
      <td>2016-05-12</td>
    </tr>
    <tr>
      <th>87</th>
      <td>000300.XSHG</td>
      <td>1.2276</td>
      <td>11.5745</td>
      <td>2016-05-13</td>
    </tr>
    <tr>
      <th>88</th>
      <td>000300.XSHG</td>
      <td>1.2342</td>
      <td>11.6369</td>
      <td>2016-05-16</td>
    </tr>
    <tr>
      <th>89</th>
      <td>000300.XSHG</td>
      <td>1.2320</td>
      <td>11.6164</td>
      <td>2016-05-17</td>
    </tr>
    <tr>
      <th>90</th>
      <td>000300.XSHG</td>
      <td>1.2254</td>
      <td>11.5540</td>
      <td>2016-05-18</td>
    </tr>
    <tr>
      <th>91</th>
      <td>000300.XSHG</td>
      <td>1.2229</td>
      <td>11.5307</td>
      <td>2016-05-19</td>
    </tr>
    <tr>
      <th>92</th>
      <td>000300.XSHG</td>
      <td>1.2285</td>
      <td>11.5835</td>
      <td>2016-05-20</td>
    </tr>
    <tr>
      <th>93</th>
      <td>000300.XSHG</td>
      <td>1.2325</td>
      <td>11.6206</td>
      <td>2016-05-23</td>
    </tr>
    <tr>
      <th>94</th>
      <td>000300.XSHG</td>
      <td>1.2253</td>
      <td>11.5534</td>
      <td>2016-05-24</td>
    </tr>
    <tr>
      <th>95</th>
      <td>000300.XSHG</td>
      <td>1.2234</td>
      <td>11.5356</td>
      <td>2016-05-25</td>
    </tr>
    <tr>
      <th>96</th>
      <td>000300.XSHG</td>
      <td>1.2260</td>
      <td>11.5599</td>
      <td>2016-05-26</td>
    </tr>
    <tr>
      <th>97</th>
      <td>000300.XSHG</td>
      <td>1.2254</td>
      <td>11.5543</td>
      <td>2016-05-27</td>
    </tr>
    <tr>
      <th>98</th>
      <td>000300.XSHG</td>
      <td>1.2295</td>
      <td>11.5928</td>
      <td>2016-05-30</td>
    </tr>
  </tbody>
</table>
</div>




```python
ii_pb.count()
```




    order_book_id    33
    pb               33
    pe_ttm           33
    trade_date       33
    dtype: int64




```python
# pe
ii_pe = ii.loc[ii['trade_date'].isin(selected_pe_date)];ii_pe
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>order_book_id</th>
      <th>pb</th>
      <th>pe_ttm</th>
      <th>trade_date</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>3</th>
      <td>000300.XSHG</td>
      <td>1.4261</td>
      <td>12.2178</td>
      <td>2016-01-07</td>
    </tr>
    <tr>
      <th>5</th>
      <td>000300.XSHG</td>
      <td>1.3884</td>
      <td>11.8948</td>
      <td>2016-01-11</td>
    </tr>
    <tr>
      <th>6</th>
      <td>000300.XSHG</td>
      <td>1.3972</td>
      <td>11.9698</td>
      <td>2016-01-12</td>
    </tr>
    <tr>
      <th>7</th>
      <td>000300.XSHG</td>
      <td>1.3723</td>
      <td>11.7569</td>
      <td>2016-01-13</td>
    </tr>
    <tr>
      <th>9</th>
      <td>000300.XSHG</td>
      <td>1.3496</td>
      <td>11.5620</td>
      <td>2016-01-15</td>
    </tr>
    <tr>
      <th>10</th>
      <td>000300.XSHG</td>
      <td>1.3506</td>
      <td>11.5709</td>
      <td>2016-01-18</td>
    </tr>
    <tr>
      <th>13</th>
      <td>000300.XSHG</td>
      <td>1.3357</td>
      <td>11.4432</td>
      <td>2016-01-21</td>
    </tr>
    <tr>
      <th>14</th>
      <td>000300.XSHG</td>
      <td>1.3488</td>
      <td>11.5549</td>
      <td>2016-01-22</td>
    </tr>
    <tr>
      <th>16</th>
      <td>000300.XSHG</td>
      <td>1.2748</td>
      <td>10.9212</td>
      <td>2016-01-26</td>
    </tr>
    <tr>
      <th>17</th>
      <td>000300.XSHG</td>
      <td>1.2718</td>
      <td>10.8956</td>
      <td>2016-01-27</td>
    </tr>
    <tr>
      <th>18</th>
      <td>000300.XSHG</td>
      <td>1.2426</td>
      <td>10.6456</td>
      <td>2016-01-28</td>
    </tr>
    <tr>
      <th>20</th>
      <td>000300.XSHG</td>
      <td>1.2558</td>
      <td>10.7581</td>
      <td>2016-02-01</td>
    </tr>
    <tr>
      <th>22</th>
      <td>000300.XSHG</td>
      <td>1.2700</td>
      <td>10.8805</td>
      <td>2016-02-03</td>
    </tr>
    <tr>
      <th>25</th>
      <td>000300.XSHG</td>
      <td>1.2664</td>
      <td>10.8501</td>
      <td>2016-02-15</td>
    </tr>
    <tr>
      <th>33</th>
      <td>000300.XSHG</td>
      <td>1.2581</td>
      <td>10.7789</td>
      <td>2016-02-25</td>
    </tr>
    <tr>
      <th>35</th>
      <td>000300.XSHG</td>
      <td>1.2479</td>
      <td>10.6908</td>
      <td>2016-02-29</td>
    </tr>
  </tbody>
</table>
</div>




```python
ii_pe.count()
```




    order_book_id    16
    pb               16
    pe_ttm           16
    trade_date       16
    dtype: int64



Ricequant 策略API

get_price - 获取合约历史数据

文档地址：[获取合约历史数据](https://www.ricequant.com/api/research/chn#research-API-get_price)

数据从 2005-01-04 开始. 用来拿到指定日期和该日期之前2年成交量的平均值

- open: 开盘价
- close: 收盘价
- high: 当日最高价
- low: 当日最低价
- total_turnover: 总成交额
- volume: 总成交量


```python
get_price('000300.XSHG', start_date='2005-01-01', end_date='2016-02-12').describe()
```

    WARN: start_date is earlier than 2005-01-04, adjusted





<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>open</th>
      <th>close</th>
      <th>high</th>
      <th>low</th>
      <th>total_turnover</th>
      <th>volume</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>count</th>
      <td>2696.000000</td>
      <td>2696.000000</td>
      <td>2696.000000</td>
      <td>2696.000000</td>
      <td>2.696000e+03</td>
      <td>2.696000e+03</td>
    </tr>
    <tr>
      <th>mean</th>
      <td>2693.010190</td>
      <td>2695.792178</td>
      <td>2724.412325</td>
      <td>2660.751158</td>
      <td>9.753338e+10</td>
      <td>8.191792e+09</td>
    </tr>
    <tr>
      <th>std</th>
      <td>1066.528197</td>
      <td>1066.182710</td>
      <td>1081.392945</td>
      <td>1046.870550</td>
      <td>1.232879e+11</td>
      <td>9.020222e+09</td>
    </tr>
    <tr>
      <th>min</th>
      <td>816.546000</td>
      <td>818.033000</td>
      <td>823.860000</td>
      <td>807.784000</td>
      <td>2.901827e+09</td>
      <td>5.014525e+08</td>
    </tr>
    <tr>
      <th>25%</th>
      <td>2172.842000</td>
      <td>2175.877250</td>
      <td>2190.866750</td>
      <td>2159.729925</td>
      <td>3.644046e+10</td>
      <td>3.568496e+09</td>
    </tr>
    <tr>
      <th>50%</th>
      <td>2597.382000</td>
      <td>2596.751000</td>
      <td>2618.367500</td>
      <td>2573.390500</td>
      <td>6.382059e+10</td>
      <td>5.697665e+09</td>
    </tr>
    <tr>
      <th>75%</th>
      <td>3297.854500</td>
      <td>3295.771500</td>
      <td>3330.435000</td>
      <td>3251.278000</td>
      <td>1.071529e+11</td>
      <td>8.693812e+09</td>
    </tr>
    <tr>
      <th>max</th>
      <td>5862.377900</td>
      <td>5877.202100</td>
      <td>5891.723100</td>
      <td>5815.608900</td>
      <td>9.494980e+11</td>
      <td>6.864391e+10</td>
    </tr>
  </tbody>
</table>
</div>




```python
'''

闰年2月有29天

pandas.Timestamp 相关

文档地址: [Timestamp](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.Timestamp.html#pandas.Timestamp)

'''

def leap_month_day(date, modify_year_number = 0, modify_day_number = 0):
    if date.is_leap_year and date.is_month_end and date.month == 2 :
        nday = date.day - 1
    else:
        nday = date.day
    if modify_day_number != 0 and (nday + modify_day_number) > date.days_in_month:
        nmonth = date.month + 1
        nday = nday + modify_day_number - date.days_in_month
    return pd.Timestamp(date.year + modify_year_number, date.month, nday + modify_day_number)
```


```python
# 利用 成交量低于2年平均值 这个条件筛选

# final_pb_date: 存放  pb 相关的 日期
final_pb_date = []
for date in selected_pb_date:
    volumes = get_price('000300.XSHG', start_date=leap_month_day(date, -2), end_date=date, fields='volume')
    if volumes[-1] < volumes.mean():
        final_pb_date.append(date)

#print(final_pb_date)

# rates_in_pb： 保存 pb 条件下得到的利润率结果
rates_in_pb = []

for day in final_pb_date:
    price_then = get_price('000300.XSHG', start_date=day, end_date=day, fields='close').values[-1]

    price_late = get_price('000300.XSHG', start_date=leap_month_day(day, 2), end_date=leap_month_day(day, 2), fields='close')
    day_time = 1
    while(price_late.empty):
        price_late = get_price('000300.XSHG', start_date=leap_month_day(day, 2), end_date=leap_month_day(day, 2, day_time), fields='close')
        day_time += 1
    price_late = price_late.values[-1]

    #print('price_then:', price_then)
    #print('price_late:', price_late)

    rates_in_pb.append(price_late / price_then - 1)

#print('rates_in_pb:', rates_in_pb)
```

将结果转换为Series类型，方便操作。


```python
s_pb_rates = pd.Series(rates_in_pb)
s_pb_rates
```




    0     0.262803
    1     0.317354
    2     0.313863
    3     0.338847
    4     0.354795
    5     0.364352
    6     0.407371
    7     0.392854
    8     0.489980
    9     0.468089
    10    0.507493
    11    0.463574
    12    0.449532
    13    0.375343
    14    0.411021
    15    0.398328
    16    0.224841
    17    0.262916
    18    0.268463
    19    0.256269
    20    0.265087
    21    0.271342
    22    0.257660
    23    0.252113
    24    0.272170
    25    0.280406
    26    0.273867
    27    0.248560
    28    0.249273
    29    0.247537
    30    0.250978
    31    0.251677
    32    0.214126
    dtype: float64




```python
s_pb_rates.describe()
```




    count    33.000000
    mean      0.323118
    std       0.085735
    min       0.214126
    25%       0.256269
    50%       0.273867
    75%       0.392854
    max       0.507493
    dtype: float64



两年32.3%的平均收益率. 最大收益率50%， 最小收益率21%

下面对pe数据做同样的处理


```python
final_pe_date = []
for date in selected_pe_date:
    if date.is_leap_year and date.is_month_end and date.month == 2 :
        nday = date.day - 1
    else:
        nday = date.day
    volumes = get_price('000300.XSHG', start_date=pd.Timestamp(date.year - 2, date.month, nday), end_date=date, fields='volume')
    if volumes[-1] < volumes.mean():
        final_pe_date.append(date)
#print(len(final_pe_date))

rates_in_pe = []

for day in final_pe_date:
    price_then = get_price('000300.XSHG', start_date=day, end_date=day, fields='close').values[-1]

    price_late = get_price('000300.XSHG', start_date=leap_month_day(day, 2), end_date=leap_month_day(day, 2), fields='close')
    day_time = 1
    while(price_late.empty):
        price_late = get_price('000300.XSHG', start_date=leap_month_day(day, 2), end_date=leap_month_day(day, 2, day_time), fields='close')
        day_time += 1
    price_late = price_late.values[-1]

    #print('price_then:', price_then)
    #print('price_late:', price_late)
    rates_in_pe.append(price_late / price_then - 1)

#print('rates_in_pb:', rates_in_pb)

```


```python
s_pe_rates = pd.Series(rates_in_pe)
s_pe_rates
```




    0     0.262803
    1     0.317354
    2     0.313863
    3     0.338847
    4     0.354795
    5     0.364352
    6     0.407371
    7     0.392854
    8     0.489980
    9     0.468089
    10    0.507493
    11    0.463574
    12    0.449532
    13    0.375343
    14    0.411021
    15    0.398328
    dtype: float64




```python
s_pe_rates.describe()
```




    count    16.000000
    mean      0.394725
    std       0.068945
    min       0.262803
    25%       0.350808
    50%       0.395591
    75%       0.453043
    max       0.507493
    dtype: float64



两年39.4%的平均收益率. 最大收益率50.7%， 最小收益率26.2%

这个收益率挺不错的。操作简单，又不花时间。

2016年到现在刚好是一个低谷到低谷的时间段。中间经历了一次峰值。以两年为期，有很多机会可以得到高于21%的收益。而且就是错过了，还有下一个两年。我觉得以长期资产的眼光来看待股票市场， 超过10%的年化收益率也已经高于市面上能接触到的理财产品了。 通过在指数成分股里面进一步缩小股票池，提高风险，也会进一步的提高潜在收益率。
