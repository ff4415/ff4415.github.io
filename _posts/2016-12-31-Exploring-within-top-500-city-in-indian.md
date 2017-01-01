---
layout: post
title: "Exploring within Top 500 Cities in Indian "
categories: Data_Analysis HighChartsMaps
Highcharts: true
---

Exploring information with dataset and maps.



> Thanks ArijitMukherjee for shared this dataset.
  I use Highcharts' geo JSON  to make the map. It's a little different from state names in the cities_r2.csv file. I've post mine in [Discussion](https://www.kaggle.com/zed9941/top-500-indian-cities/discussion/27129).

## Satellite map

A Satellite map showed around Indian. It shall make an overview of Indian.

![Satellite map](https://api.mapbox.com/styles/v1/ff4415/cix1w520g00482pnw4pkzc63r/static/84.351225,22.561815,3.33,0.00,0.00/800x500?access_token=pk.eyJ1IjoiZmY0NDE1IiwiYSI6ImNpeDF0cmZzMDAwOWEyb3JzZXlkbHNvY3oifQ.9tLzTgNhfUwANjv6OA0PvA)

## Highmaps

I collect data into a HighChartsMap, one can switch each set and download as PNG file in the menu button upper right corner.

{% include top-500-city-in-Indian.html %}

---

Exploring more of using this and Google earth together.

## kaggle notebook

link: [*Exploring within Top 500 Indian Cities*](https://www.kaggle.com/ff4415/d/zed9941/top-500-indian-cities/exploring-within-top-500-indian-cities)

```python
# This Python 3 environment comes with many helpful analytics libraries installed
# It is defined by the kaggle/python docker image: https://github.com/kaggle/docker-python
# For example, here's several helpful packages to load in

import numpy as np # linear algebra
import pandas as pd # data processing, CSV file I/O (e.g. pd.read_csv)

# Input data files are available in the "../input/" directory.
# For example, running this (by clicking run or pressing Shift+Enter) will list the files in the input directory

from subprocess import check_output
print(check_output(["ls", "../input"]).decode("utf8"))

# Any results you write to the current directory are saved as output.
```


```python
data = pd.read_csv('../input/cities_r2.csv')
```

## States by numbers of city in Top 500


```python
rawData = pd.value_counts(data['state_name'])

cityNumber_Of_State = pd.DataFrame(columns=['woe-name', 'value'])
cityNumber_Of_State['woe-name'] = rawData.index
cityNumber_Of_State['value'] = rawData.values
cityNumber_Of_State.sort_values

cityNumber_Of_State.to_json('city_number_of_state.json',orient='records')
```


![state_by_numbers_of_city](https://ff4415.github.io//assets/images/top-500-city-in-Indian/state_by_numbers_of_city.png)


UTTAR PRADESH state has  63 cities and  WEST BENGAL state has 61 cities almost contain quarter of all cities.

Refer back to the satellite map, There two states under the Himalayas with Suitable temperature and water source. The beautiful green on the satellite map impressed me.

## States by literacy_rate_total of cities in Top 500

I did not use 'effective_literacy_rate_total' column,and use a ' literacy_rate_total' to rank cities.

---

For exemple by **Abohar** city:

effective_literacy_rate_total = 79.86%

population_total = 145238

literates_total = 103319

let literacy_rate_total = literates_total / population_total = 71.13%

---
> *It's not accurate, but I think it's enough to rank cities*.


```python
literacy_rate_total_of_states = pd.DataFrame(columns=['woe-name','value'])
rawData = data[['state_name','population_total','literates_total']]
rawData.head()
```


```python
rawData = rawData.groupby('state_name').apply(lambda data: data['literates_total'].sum()/data['population_total'].sum() * 100)
rawData.sort_values(ascending=False)
```


```python
literacy_rate_total_of_states['woe-name'] = rawData.index
literacy_rate_total_of_states['value'] = rawData.values;literacy_rate_total_of_states.head()

literacy_rate_total_of_states.to_json('literacy_rate_total_of_states.json',orient='records')
```

![state_by_literacy_rate_total](https://ff4415.github.io//assets/images/top-500-city-in-Indian/state_by_literacy_rate_total.png)

Top 3 states are :

KERALA 87.14%

HIMACHAL PRADESH  87.06%

MIZORAM 86.90%.

The common I see is water. Two around the Himalayas and one located by the sea.  These numbers attenuate by a very Linear.  It seems mean something.

## States by female_graduates percentage in entire female population of cities


```python
female_graduates_of_states = pd.DataFrame(columns=['woe-name','value'])
rawData = data[['state_name','female_graduates','population_female']];rawData.head()
```


```python
rawData = rawData.groupby('state_name').apply(lambda data: data['female_graduates'].sum()/data['population_female'].sum() * 100)
rawData.sort_values(ascending=False)
```


```python
female_graduates_of_states['woe-name'] = rawData.index
female_graduates_of_states['value'] = rawData.values;female_graduates_of_states.sort_values('value',ascending=False).head()

female_graduates_of_states.to_json('female_graduates_of_states.json', orient='records')
```

![state_by_female_graduates_Percentage](https://ff4415.github.io//assets/images/top-500-city-in-Indian/state_by_female_graduates_Percentage.png)

Female_graduates percentage attenuated a little sharp. HIMACHAL PRADESH state is a great place with most percentage of educated population.

## States by total_graduates percentage in entire population of cities

```python
total_graduates_of_states = pd.DataFrame(columns=['woe-name','value'])
rawData = data[['state_name','total_graduates','population_total']]
rawData.head()
```


```python
rawData = rawData.groupby('state_name').apply(lambda data: data['total_graduates'].sum()/data['population_total'].sum() * 100)
rawData.sort_values(ascending=False)
```


```python
total_graduates_of_states['woe-name'] = rawData.index
total_graduates_of_states['value'] = rawData.values;total_graduates_of_states.sort_values('value', ascending=False).head()

total_graduates_of_states.to_json('total_graduates_of_states.json', orient='records')
```

![states_by_total_graduates_Percentage](https://ff4415.github.io//assets/images/top-500-city-in-Indian/states_by_total_graduates_Percentage.png)

HIMACHAL PRADESH state. This state seems a little special. It has only one city of the Top 500 cities, with the most percentage of an educated population.

## Where are the top 500 cities


```python
cityPopulation = pd.DataFrame(columns=['city', 'state_name', 'lat','lon','population'])
cityPopulation['city'] = data.name_of_city
cityPopulation['population'] = data.population_total
cityPopulation['state_name'] = data.state_name

temp = data.location
for index in temp.index:
    tempArr=temp[index].split(',')
    #print(   tempArr)
    cityPopulation.at[index,'lat'] = float(tempArr[0])
    cityPopulation.at[index,'lon'] = float(tempArr[1])
#mapData.at[1,'population']
cityPopulation.head()

cityPopulation.to_json('city_population.json',orient='records')
```

![cities_by_city_population](https://ff4415.github.io//assets/images/top-500-city-in-Indian/cities_by_city_population.png)

City belt with a hollow core. Cities located coastally and under the Himalayas. cities are sparse inland. It affected by business water source and climate. Look at these mega cities, they almost located coastally.

## City by effective_literacy_rate_total


```python
effective_literacy_rate_total = pd.DataFrame(columns=['city', 'state_name', 'lat','lon','effective_literacy_rate_total'])
effective_literacy_rate_total['city'] = data.name_of_city
effective_literacy_rate_total['effective_literacy_rate_total'] = data.effective_literacy_rate_total
effective_literacy_rate_total['state_name'] = data.state_name

temp = data.location
for index in temp.index:
    tempArr=temp[index].split(',')
    #print(   tempArr)
    effective_literacy_rate_total.at[index,'lat'] = float(tempArr[0])
    effective_literacy_rate_total.at[index,'lon'] = float(tempArr[1])

effective_literacy_rate_total.sort_values(by='effective_literacy_rate_total',ascending=False).head()
```


```python
effective_literacy_rate_total.sort_values(by='effective_literacy_rate_total',ascending=False).tail()
```


```python
effective_literacy_rate_total.describe()
```

As seen here nearly half of cities located between in 81% to 89%,so I only chose first 25% cities and last 25% cities to mark on the map.


```python
top = effective_literacy_rate_total.nlargest(125,'effective_literacy_rate_total')
top.head()

top.to_json('top_in_effective_literacy_rate_total.json',orient='records')
```

![top_125_cities_by_effective_literacy_rate_each_city](https://ff4415.github.io//assets/images/top-500-city-in-Indian/top_125_cities_by_effective_literacy_rate_each_city.png)


```python
tail = effective_literacy_rate_total.nsmallest(125,'effective_literacy_rate_total')
tail.head()

tail.to_json('tail_in_effective_literacy_rate_total.json',orient='records')
```

![last_125_cities_by_effective_literacy_rate_each_city](https://ff4415.github.io//assets/images/top-500-city-in-Indian/last_125_cities_by_effective_literacy_rate_each_city.png)

Cities in effective_literacy_rate, top 25% tend to be located coastally.  And last 25% tend to be located inland.

## Cities by female_graduates Percentage in Entire Female Population


```python
female_graduates = pd.DataFrame(columns=['city', 'state_name', 'lat','lon','female_graduates_ratio'])
female_graduates['city'] = data.name_of_city
female_graduates['female_graduates_ratio'] = data.female_graduates/data.population_female *100
female_graduates['state_name'] = data.state_name

temp = data.location
for index in temp.index:
    tempArr=temp[index].split(',')
    female_graduates.at[index,'lat'] = float(tempArr[0])
    female_graduates.at[index,'lon'] = float(tempArr[1])
female_graduates.describe()
```

---

The female_graduates_in_female_population has a huge gap. The Minimum is nearly 1.44% and maximum is more than 39% .

So I also choosed first 25% cities and last 25% cities to mark on the map.


```python
top_125_city_by_female_graduates = female_graduates.nlargest(125,'female_graduates_ratio')
top_125_city_by_female_graduates.head()

top_125_city_by_female_graduates.to_json('top_125_city_by_female_graduates.json',orient='records')
```

![top_125_cities_by_female_graduates](https://ff4415.github.io//assets/images/top-500-city-in-Indian/top_125_cities_by_female_graduates.png)


```python
tail_125_city_by_female_graduates = female_graduates.nsmallest(125,'female_graduates_ratio')
tail_125_city_by_female_graduates.head()

tail_125_city_by_female_graduates.to_json('tail_125_city_by_female_graduates.json',orient='records')
```

![last_125_cities_by_female_graduates](https://ff4415.github.io//assets/images/top-500-city-in-Indian/last_125_cities_by_female_graduates.png)

It seems near the Himalayas low female_graduates cities surround high female_graduates cities. And in low latitude regions,  high female_graduates cities tend to be located coastally. I suppose people are migrating. educated peoples attract educated peoples. Matthew effect.

## Cities by total_graduates percentage in entire population


```python
total_graduates_ratio_each_city = pd.DataFrame(columns=['city', 'state_name', 'lat','lon','total_graduates_ratio'])
total_graduates_ratio_each_city['city'] = data.name_of_city
total_graduates_ratio_each_city['total_graduates_ratio'] = data.total_graduates/data.population_total * 100
total_graduates_ratio_each_city['state_name'] = data.state_name

temp = data.location
for index in temp.index:
    tempArr=temp[index].split(',')
    #print(   tempArr)
    total_graduates_ratio_each_city.at[index,'lat'] = float(tempArr[0])
    total_graduates_ratio_each_city.at[index,'lon'] = float(tempArr[1])
#mapData.at[1,'population']
total_graduates_ratio_each_city.describe()
```

---

Same story as above. Mark top 25% cities and last 25% cities to the map.


```python
top_125_city_by_total_graduates_ratio = total_graduates_ratio_each_city.nlargest(125,'total_graduates_ratio')
top_125_city_by_total_graduates_ratio.head()

top_125_city_by_total_graduates_ratio.to_json('top_125_city_by_total_graduates_ratio.json',orient='records')
```

![top_125_cities_by_total_graduates_ratio](https://ff4415.github.io//assets/images/top-500-city-in-Indian/top_125_cities_by_total_graduates_ratio.png)


```python
tail_125_city_by_total_graduates_ratio = total_graduates_ratio_each_city.nsmallest(125,'total_graduates_ratio')
tail_125_city_by_total_graduates_ratio.head()

tail_125_city_by_total_graduates_ratio.to_json('tail_125_city_by_total_graduates_ratio.json',orient='records')
```

![last_125_cities_by_total_graduates_ratio](https://ff4415.github.io//assets/images/top-500-city-in-Indian/last_125_cities_by_total_graduates_ratio.png)

Same story as above.  

thanks for reading.

More detailed map visit here [ff4415.github.io]({{  page.url }})
