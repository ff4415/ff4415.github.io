---
layout: post
title:  "MongoDB 技巧50"
date:   2018-07-10 18:11:45 +0800
categories:  sql MongoDB
cover: '/assets/images/47152268_p0.jpg'
---

`MongoDB`

---


﻿# MongoDB 技巧 50

标签（空格分隔）： MongoDB

---
[toc]
## 应用设计技巧
### 1. 速度和完整性的折中

多个文档中使用的数据既可以采用内嵌（子文档-反范式化）的方式，也可以采用引用的方式（范式化）。

- 反范式化（子文档）会产生不一致的数据。同一个概念在多处出现。并且数据不同步。
- 范式化会产生一次额外的查找。

#### 示例： 购物车

范式化设计

```
商品
{
    "_id": productId,
    "name": name,
    "price": price,
    "desc": description
}
订单
{
    "_id": orderId,
    "user": userInfo,
    "items": [
    productId1,
    productId2,
    productId3
    ]
}
```
> 范式化的结果是读取速度较慢，但是所有订单的一致性会有保证。多个文档会原子性的更新（因为仅仅引用的文档会更新）

反范式化设计
```
商品
{
    "id": productId,
    "name": name,
    "price": price,
    "desc": description
}
订单
{
    "_id": orderId,
    "user": userInfo,
    "items": [
        {
            "id": productId1,
            "name": name,
            "price": price,
        },
        {
            "id": productId2,
            "name": name,
            "price": price,
        },
        {
            "id": productId3,
            "name": name,
            "price": price,
        }
    ]
}
```

> 反范式化读取速度快，一致性稍弱。

- 可能读取一万次才修改一次。是否要为了保证一致性搭上一万次读取消耗。
- 引用数据更新越少，越适合反范式化。
- 一致性如果很重要，需要范式化。比如证卷交易有时需要`锁`文档。
- 想要读取尽可能快，则要反范式化。

### 2. 适应未来的数据要范式化

范式化使数据可用性更长久， 可能要以不同方式被查询的数据。

### 3. 尽量单个查询获取数据

应用单元
- 对后端的一次请求视为一个应用单元
- 对桌面系统，一次用户交互算作一个应用单元
- 对分析系统，一个图表的加载算作一个应用单元

#### 示例，博客

对一篇博客文章的请求就是一个应用单元。将所有信息都嵌入到文章文档中，以便一次查询获得所有数据。

```
> db.posts.find({}, {"title": 1, "author": 1, "slug": 1, "_id": 0}).sort({"date": -1}).limit(10)
```

含有指定标签的20篇文章输出到一个页面

```
> db.posts.find({"tag": someTag}, {"title": 1, "author": 1, "slug": 1, "_id": 0}).sort({"date": -1}).limit(20)
```

#### 示例，相册

相册， 用户创建或者回复含有照片和文字的帖子

```
> db.posts.find({"threadId"： id}).sort({"date": -1}).limit(20)
```

查询下一页的内容，就查询紧接地0条内容
```
> db.posts.find({"threadId"： id, "date": {"$gt": lastestDateSeen}}).sort({"date": -1}).limit(20)
```

### 4. 嵌入关键数据

在嵌入和引用之间犹豫不决时， 想想查询的目的是什么， 是为了获得字段本身的信息，还是为了进一步获取更广泛的信息。

从关系型数据库迁移到MongoDB,联接表是重点要考虑嵌入的对象。 那些仅有一个键，一个值的表(如，标签，权限，地址)在MongoDB几乎都应该做嵌入处理。

某些信息只在一个文档中使用，则应该嵌入这个文档。

### 5. 嵌入时间点数据

那种特定于某一个时刻的时间点数据，都应该做嵌入处理。

### 6. 不要嵌入不断增长的数据

MongoDB存储数据的机制决定了对数组不断追加数据是很低效的。

嵌入多少个子文档都不是问题。关键是之后这么做了之后，基本保持不变。

比如评论。有的系统评论自成条目，动辄成百上千条。这种情况应该将其放入独立文档。

### 7. 预先填充数据

第一次插入时就带着字段比用到时候在创建效率更高。(mongoose的schemas解决了这个问题)

### 8. 尽可能预先分配空间

在mongoose里面设置一个默认值

为文档今后的增长分配足够的空间

### 9. 用数组存放要匿名访问的内嵌数据

如果确切的知道要查询的内容，用子文档。如果有时不太清楚查询的具体内容，就用数组。

找出damage大于20的项

```
"_id": "fred",
"items": [
    {
        id: "slingshot",
        type: "weapon",
        damage: 23,
        ranged: true
    },
    {
        id: "jar",
        type: "container",
        contains: "fairy"
    },
    {
        id: "sword",
        type: "weapon",
        damage: 50,
        ranged: false
    }
]
```

查询条件`{"items.damage": {"$gt": 20}}`就行了，如果多条查询，使用`$elemMatch`

### 10. 文档要自给自足

MongoDB几乎不做数据处理，仅仅存储数据。 避免让MongoDB做些能在客户端完成的计算。

要找的信息必须经过计算，且无法直接从文档中获得。
- 付出高昂的性能代价(强制MongoDB用js计算)
- 优化文档结构，使得信息能从文档获得

找apples和oranges总数为30的文档。

文档结构

```
{
    _id: 123,
    appples: 10,
    oranges: 5
}
```

在文档加个`total`字段

```
{
    _id: 123,
    apples: 10,
    oranges: 5,
    totoal: 15
}
```

```
> db.food.update(criteria, {"$inc": {apple: 10, oranges: -2, total: 8}})

> db.food.findOne()

{
    _id: 123,
    apples: 20,
    oranges: 3,
    total: 23
}
```

如下文档：

```
{
    _id: 123,
    apples: 20,
    oranges: 3,
    total: 2
}
```

如果一个更新可能创建新字段，也可能不创建。怎么办。

```
> db.food.update({_id: 123}, {"$inc": {banana: 3, total: 1}})
```

如果创建了新字段，total要增加，反之，则不增加。 但是客户端并知道banana字段是否存在。

快速的做法是简单每次都给total加1或者不加， 然后让应用在客户端验证实际总数，可以做一个一直在后台运行的批处理任务来纠正这些不一致。

或者应用实时性要求不高，可以用`findAndModify`来**锁** 住文档(设定`locked`字段， 其它写入会手动检测这个字段)，返回文档，然后同时对文档解锁并更新相应的字段和`total`:

```
> var result = db.runcommand({"findAndModify": "food",
                     "query": {/* 其它条件 */， "locked": false},
                     "update": {"$set": {"locked": true}}
                })
>
> if ("banana" in result.value) {
    db.fruit.update(criteria,
            {"$set": {"locked": false}, "$inc": {"banana": 3}}
    )
  } else {
  // 如果banana不存在，则将total递增
    db.fruit.update(criteria,
        {"$set": {"locked": false}, "$inc": {"banana": 3, "total": 1}}
    )
  }
```

### 11. 优先使用**$**操作符

可以在文档中使用`$where`子句来执行javaScript代码

```
> db.members.find({"$where": function () {
    return this.member[0].age == this.member[1].age;
}})
```

`$where`效率不高，对于普通查询，客户端将查询转化成BSON，发送给数据库。MongoDB数据也是BSON，直接比较就行了。高效。

`$where`将集合中的每一个文档都转化成javaScript对象，解析文档的BSON并添加他们的所有字段到javaScript对象。然后执行javaScript，再之后销毁。极其消耗时间和资源。

可以减少`$where`要匹配文档的数量来缓解性能损失。`$where`遍历的文档越少，需要的时间越少。设置一些不用`$where`就能执行的查询条件，并放在其前面。

```
> db.members.find({type:{$in: {joint: 'family'}}, "$where": function () {
    return this.member[0].age == this.member[1].age;
}})
```

### 12. 随时聚合

尽可能用`$inc`随时计算聚合。

分析程序有按分钟和按小时的统计数据。增加按分钟统计的数据时，同时可以增加按小时统计的数据。

如果聚合需要进一步计算，就要将数据存放到分钟字段中。然后由后台的批处理按分钟字段中的最新数据计算平均值。由于所有需要聚合的信息都在一个文档，对比较新的文档，甚至可以把计算放在客户端。旧文档，应该都通过批处理计算完了。

### 13. 编写代码处理数据完整性问题

MongoDB的无模式的特点和反范式的优势，需要注意应用数据的一致性问题。

系统崩溃导致的不一致，更新限制导致的不一致，要有个脚本做数据验证。
建议的几个cron任务

- 一致性修复器：核对数据，检查重复数据，确保数据一致性
- 预分配器： 创建今后要用到的文档
- 聚合器： 更新文档内部的聚合数据，使之为最新数据
- 结构校验器： 确保当前所用的文档都有指定的字段，否则就自动校正或者发送通知
- 备份任务L定期对数据库做fsync， 加锁和导出操作


## 实现技巧
### 14. 使用正确的类型

数字

日期
iso格式yyyy-mm-dd， date类型要求匹配到到毫秒。

字符串
MongoDB 字符串都是UTF-8编码的，其它编码要不转，要不以二进制存储。

ObjectId
ObjectId就以ObjectId存储， 不要存储为字符串。
- 方便查询
- ObjectId含有有用信息。文档创建时间
- 字符串表示的ObjectId多占两倍空间

### 15. 用简单唯一的id替换_id

要是数据本身没有一个唯一字段，就用默认的ObjectId作为_id。但是若是数据本身就是唯一的字段，并且不需要ObjectId的功能那么就用自己的位移值覆盖默认的_id好了。这样会节省一些空间。
自定义的_id，第一，要确保唯一性，要处理键值重复异常。第二， 留意索引的树结构。ObjectId的插入顺序好，值总是增加，所以插入总是在B数的右侧边上进行。

### 16. 不要用文档做_id

### 17. 不要用数据库引用

指子文档形式的数据库引用。

数据库引用指`{$id: identifier, $ref: collectionName}`这样的子文档。

### 18. 不要用GridFS处理小的二进制数据

GridFS 需要查询两次， 一次获取文件的元信息，一次获取其内容。GridFS是用来将打的二进制数据切成小片存放到数据库中。

因为过大而使客户端一次加载不了的东西一般也不需要服务器一次加载。所以那些作为数据流传递给客户端的数据非常适合GridFS。

需要在客户端一次全部加载的东西，图片、声音、小的视频，通常都应该嵌入到主文档。

### 19. 处理"无缝"故障切换
发送给服务器一个请求，得到了网络错误，这时驱动有很多选择。
若服务器不能重连数据库。显然就不能重新尝试发送请求。但是，若驱动知道有另外一台服务器，他可以自动对其发送请求吗？ 如果是对活跃节点的写入，可能就没有别的活跃节点了。要是读取，比如需要执行很久的MapReduce操作，本来执行任务的从属节点出故障了，驱动也不应该转发请求到随便选的其它服务器。所以，对另一台服务器不能自动重试。

驱动将问题推给了使用者。 使用者处理异常。

### 20. 处理复制组失效及故障恢复

应用要能处理所有复制组会遇到的极端情况

假设应用抛出“not master”异常。 可能几个原因： 复制组正在做故障恢复，应用必须要平滑地应对活跃节点选举的这段时间。选举的时间不尽相同，一般只需要几秒钟，但也有超过60秒。若被分割到了网络上状态不佳的一部分，可能数小时连不上主节点。

看不到主节点是要重点处理的情况，如果遇到，应用能降级为只读模式吗？ 应用能应对短时（活跃节点选举）只读和长时（大部分机器宕机或者网络割裂）只读。

无论有没有节点，都应该能继续从能连接的节点读取数据。

节点在选举期间会进入短暂的不可读的“恢复”阶段，驱动若是请求读取处于这种状态的节点，则这些节点会抛出错误表明自己“既不是主节点也不是从属节点”。这种状态也可能非常短暂，以至于就倍驱动发送给数据库的两次ping错过了。

## 优化技巧
### 21. 尽可能减少磁盘访问

内存访问比磁盘访问要快的多。 所以，优化的本质就是尽可能的减少对磁盘的访问。

读磁盘要消耗很长时间

- 使用SSD
- 增加内存，同时让应用尽可能的只读取在内存中的数据，尽量避免磁盘和内存之间的数据访问。

访问新数据比老数据更频繁，一些用户比其它用户更加活跃，特点区域比其它地方拥有更多的客户。通过设计， 让一部分文档存在内存中， 极大减少硬盘访问。

### 22. 使用索引减少内存占用

```flow
st=>start: 查询
op1=>operation: 把文档的一页
加载到内存中
op2=>operation: 比较文档和查询
cond1=>condition: 有匹配吗?
op3=>operation: 添加结果
c2=>condition: 结果满了吗?
op4=>operation: 把结果返回客户端
e=>end

st->op1->op2->cond1->op3->c2
cond1(yes)->op3
cond1(no)->op1
c2(yes)->op4
c2(no)->op1
```


查询--->  把文档的一页加载到内存中
    │                │
    │        比较文档和查询
    │   no           │
    └─────────────有匹配吗
    │                │  yes
    │             添加结果
    │    no          │  yes
    └─────────────结果满了吗
                    │  yes
                把结果返回客户端

    假设内存页大小为4k
    MongoDB 把文档第一个页面加载到内存并与查询比较。然后加载下一页并比较，直到比较完全部数据。没有捷径可循。必须遍历整个数组。

避免每次查询都加载全部数据。 要对指定字段X创建索引。 MongoDB会创建相应的树，大体预处理这些数据，将集合中的每个x值都添加到有序树中。树中每个索引项都含有x的值和一个指向对应文档的指针。

### 23. 不要到处使用索引

根据经验，一旦要大约返回集合的一半的数据就不要使用索引。

写入速度

插入数据时，MongoDB需要找的文档中的值在每个索引树中的位置，然后在那里插入。删除时，要找到树中的索引项并删除。值更新了则即会有添加又有删除项。所以，索引会增加很多额外的写入。

### 24. 索引覆盖查询

如果只想访问某些字段且所有这些字都可放在索引中， MongoDB可以做索引覆盖查询(covered index query)，这种查询
不会访问指针指向的文档，而是直接用索引的数据返回结果。

```
// 有索引:
> db.foo.ensureIndex({"x": 1, "y": 1, "z": 1})
// 查询被索引的字段，并只要求返回这些字段
> db.foo.find({"x": criteria, "y": criteria}, {"x": 1, "y": 1, "z": 1, "_id": 0})
```

这样查询就只访问了索引的数据，没有访问整个集合

_id不是索引的一部分，所以去掉了。

### 25. 使用符合索引加快多个查
```
collection.find({x: criteria, y: criteria, z: criteria})
collection.find({z: criteria, y: criteria, w: criteria})
collection.find({y: criteria, w: criteria})

```
y 字段是唯一一个每次查询都有的，所以很适合放到索引中，z在前两个中出现，w在后两个出现，因此这两个是仅次于y字段的合适选项

索引命中率越高越好。某个查询如果更重要或者执行频繁，索引要针对他进行优化。

可以用`explain`查看查询中索引的使用
```
collection.find(criteria).explain()
```

### 26. 通过建立分级文档加速扫描

数据组织有层次，看起来更有条理。

```
{
    _id: id,
    name: username,
    email: email,
    twitter: username,
    screenname: username,
    facebook: username,
    linkedin: username,
    phone: number,
    street: street,
    city: city,
    state: state,
    zip: zip,
    fax: number
}

// 查询要遍历每个文档的每个字段
> db.user. find({zip: 10003})
```
换个结构

```
{
    _id: id,
    name: username,
    online: {
        email: email,
        twitter: username,
        screenname: username,
        facebook: username,
        linkedin: username
    },
    address: {
        street: street,
        city: city,
        state: state,
        zip: zip
    },
    tele: {
        phone: number,
        fax: number
    }
}

// 在找到匹配的address前，紧查看_id,name和online，然后在address中匹配zip
> db.users.find("address.zip": "10003")
```


### 27. AND型查询要点

假设查询满足条件A,B,C的文档。若满足A的文档有40000，满足B的9000， 满足C的200。
把C放在最前面，然后是B，最后是A，则针对BC的查找最多只需200文档。
如果已知某个查询条件更加苛刻，则将其放在最前面。尤其是其有索引时。

### 28. OR型查询要点

OR型查询和AND型查询相反。匹配最多的查询条件放在最前面，因为每次要匹配不在结果集中的文档。

## 数据安全性和一致性

### 29. 单机做日志, 多级做复制

要么多花时间确保数据安全,要么只能加快速度但使数据不怎么安全.

复制和日志是MongoDB确保数据安全性的两种途径

通常都要使用复制,而且至少要有一台服务器启用日志.

MongoDB复制自动在服务器间同步写入操作.如果活跃节点停机,则可以将另一台服务器选作主节点.

如果复制组中的一个节点没有正常停机,也没有启动 --journal 选项, MongoDB并不能保证数据安全性(数据可能损坏).

日志能保证单个服务器的数据安全.所有操作都将被记录下来(日志)并定期写入磁盘.如果机器崩溃了,但是硬盘还是好的,你可以重启服务器,数据会自动根据日志完成恢复.

虽然日志和复制可以同时使用,但是性能会受到影响. 两种方式都会将所有写入进行备份,以下选择:

- 无安全措施: 每个请求写入一次
- 复制: 每个请求写入两次
- 日志: 每个请求写入两次
- 复制+日志: 每个请求写入3次

### 30. 坚持使用复制或日志,或两者兼用

单一服务器要用 --journal 选项

> 开发过程建议一直开 --journal 选项,不丢失数据

多台机器情况可以混合使用启用日志和不启用日志的服务器,以防性能下降太多. 备份用的从属节点可以用日志,活跃节点和热备节点可以不用.

### 31. 不要信任repair恢复的数据

推荐做法是从备份快速恢复,或者从头开始同步.同步数据之前一定要清除所有损坏的数据,MongoDB复制是不能修复这些损毁数据的.

### 32. getlasterror

默认下,写入不返回任何数据库响应. 需要得到数据库响应,MongoDB有个返回上个指令执行状态的命令,叫做getlasterror. getlasterror和写入请求绑定在一块,强制数据库将两者作为一个请求.驱动会自动处理这些.

### 33. 开发过程中一定要使用安全写入

开发中许多错误会导致写入失败, 这些都需要了解和处理.

### 34. 使用W参数

w 表示至少要有多少台服务器写入了才返回成功.发送getlasterror到服务器,服务器清楚自己在oplog中的位置,等待w-1个节点完成123号操作.一旦w等于0,getlasterror就返回成功.

复制的写入总是按照一定次序进行的,数据集总是一致的. 不会丢失操作.

```
// 强制num-1个节点与活跃节点同步:
> db.runCommand({getlasterror: 1, w: num})
```

要想绝对安全 w 就得大于节点数的一半. 当然,小于半数也行.

需要越多节点同步,完成的可能性就越低.

### 35. 一定要给 w 设置超时

假设3个节点的复制组(一个活跃和两个热备), 做两个从属节点与主节点的同步:

```
> db.runCommand({getlasterror: 1, w: 3})
```

如果有个热备节点停机了,MongoDB也不会检查集群内热备节点的数量,还是等待w个从属节点复制完成.

设置合理的wtimeout 参数

```
// 100毫秒过期
> db.runCommand({getlasterror: 1, w: 2, wtimeout: 100})
```

### 36. 不要每次写入都调用fsync

有重要数据在日志记录时,写入时一定使用fsync选项.fsync会等待数据成功写入日志(最多100毫秒), 然后才返回成功. fsync并不是立即将数据写入磁盘,而是让应用程序暂停直至数据被写入磁盘.所以若每次插入都运行fsync, 则每100毫秒只能插入一次.

通常fsync只与日志搭配使用.不要在未开启日志时使用fsync. 严重影响性能.

### 37. 崩溃之后正常使用

开启日志,虽然崩溃,但系统可以恢复,数据库可以正常重启.
```
--dbpath // 指定日志文件目录
--journal // 开启日志
```

日志文件存放在日志目录中,不要删除.

### 38. 持久性服务器的瞬间备份

备份开启日志的数据库
- 直接对文件系统做快照
- 用fsync和锁配合, 然后导出数据库

注意不能没有执行fsync和上锁就直接复制所有文件, 因为文件复制不能瞬间完成.若复制数据库和日志的时间点不同,这样还不如不备份.

## 管理技巧

### 39. 手工清理块集合

GridFS将文件内容保存在块集合,默认集合名是fs.chunks. 文件集合中的每个文档都会指向块集合中的一个或多个文档.
注意经常检查有没有没和文件关联的块.数据库在保存文件的过程异常关机就可能出现这种情况.

检查块集合要在流量较小的时段

```
> var cursor = db.fs.chunks.find({}, {_id: 1, files_id: 1});
> while (cursor.hasNext()) {
    var chunk = cursor.next();
    if (db.fs.files.findOne({_id: chunk.files_id}) == null) {
        print("orphaned chunk: " + chunk._id);
    }
}
```

这样就能找到孤悬块的_id

用`db.currentOp()`指令取消当前操作,之后看看fs.files集合查看最近的uploadDate

### 40. 用repair压缩数据库

不建议用repair去恢复数据, 不过适合用来压缩数据.

repair 基本就是mongodump加mongorestore, 通过这个过程将数据都整理出来,形成整洁的数据副本, 移除文件的所有数据碎片. (当有大量删除或者更新而导致数据移动, 集合中就会出现很多空洞) repair会以压缩形式重新插入数据

使用repair注意事项:

- 这样会阻塞操作,所以不要在活跃节点上执行.一般先在热备节点上执行,然后让活跃节点和热备节点交换角色,再在原来的活跃节点(现在的热备节点)上执行这个操作.
- 需要使用是原来数据库两倍的磁盘空间(若有200GB数据,则还要至少200GB空虚磁盘空间才能运行repair)

如果repair要处理的数据量太大, 就只能使用`mongodump`和`mongorestore`来进行恢复了.

```
// ny1 是主节点,　令其降级,执行fsync并加锁,确保磁盘数据一致性
> rs.stepDown()
> db.runCommand({fsync: 1, lcok: 1})
//　登录到ny2执行
ny2$ mongodump --host ny1
// 将数据导出到ny2上的dump目录
```

物理访问,加一块硬盘,　做本地的mongodump

导出成功后就可以在ny1上恢复数据了

-　停止ny1上的mongod进程
-　备份ny1上的数据文件,以防万一
-　删除ny1上的数据文件
-　重启ny1(现在没有数据文件).　如果其在某个复制组,　启动时要指定一个不同的端口并去掉 --replSet　参数.为了不予其它复制组中的节点混淆.

最后在ny2上执行`mongorestore`
```
ny2$ mongorestore --host ny1 --port 10000 # specify port if it's not 27017
```
这样ny1就有压缩形式的数据库文件了.

###　41. 不要改变复制组成员投票的权限

要是希望某个机器优先成为活跃节点,需要设置权限.１.９.０可以为某个节点设置相对较高的权值,　这样此节点总会成为活跃节点.

###　42. 无活跃节点时可重制复制组

如果复制组中只有少数节点在运行,　系统就会忽略本地数据库.然后重新配置复制组.这样会有一些停机时间,因为要重建复制组和重新分配oplog.如果想让应用保持运行,前提是得有多于一个从属节点仍在工作.

选一个从属节点,将其关停,然后去掉 --replSet 选项并用另外一个端口启动.
```
// 原本这样
$ mongod --replSet foo --port 5555
//可以这样重启
$ mongod --port 5556
```

这样复制组内其它节点不会将其作为这一复制组的一员(因为端口不同了),　它本身也不会使用复制组的配置.　

更改复制组配置信息

```
> use local
> config = db.system.replset.findOne()
//　针对４个节点的集群
{
    _id: "foo",
    version: 2,
    members: [
        {
            _id: 0,
            host: "rs1:5555"
        },
        {
            _id: 1,
            host: "rs2:5555",
            arbiterOnly: true
        },
        {
            _id: 2,
            host: "rs3:5555",
        },
        {
            _id: 3,
            host: "rs4:5555",
        }
    ]
}
//　３个节点,包括rs1,rs2和rs4, 删除rs3
> config.slice(2,1)
> config {
     _id: "foo",
    version: 2,
    members: [
        {
            _id: 0,
            host: "rs1:5555"
        },
        {
            _id: 1,
            host: "rs2:5555",
            arbiterOnly: true
        },
        {
            _id: 3,
            host: "rs4:5555",
        }
    ]
}
// 不要把rs4的_id改为２,　这样会造成混乱.
```

然后增加版本号(config.version),　通知其它节点配置有更新,需要同步

再次确认配置文档,确信配置完全符合预期时,停掉服务器.然后用正常参数重新启动就好(--replSet和标准端口).　更新配置,选出新的活跃节点.

###　43. 不必指定　--shardsvr　和　--configsvr　参数

这些参数只是改变端口而已.　--shardsvr 将端口改为27018, --configsvr 将端口改为27019,　还会启用*dialog*.　性能没有日志好.　

用 -- port 27019 和 -- journal

###　44. 开发时才用　--notablescan

--notablescan 选项,　一旦开启,　就会在某个查询要做表扫描是返回错误(处理使用索引的查询时正常).　开发是想确保所有查询都用到索引时,这个选项就非常有用了.　不建议在生产环境使用,　很多简单的管理任务都要需要表扫描.
--notablescan 选项,　是调试的好工具.　但只用索引查询通常不切实际.

### 45. 学习JavaScript

        -__-


### 46. 在shell中管理所有服务器和数据库

默认, mongod连接localhost:27017. 启动时可以任意指定要连接的服务器, 方法是运行mongod host: port/mongodb

```
// 用不同的变量表示不同的数据库
> db
test
> customers = db.getSisterDB("customers")
customers
> game = db.getSisterDB("game")
game
```
可以将db或者其它变量指向其它数据库

```
> db = connect("nyla:27017/foo")
connecting to: nyla:27017/foo
foo
> db
foo
```

运行复制组或者分片集群时需要连接多个节点.在shell中可以同时维护到主节点和从属节点的连接:

```
> master = connect("ny1a:27017/admin")
connecting to: ny1a:21017/admin
admin
> slave = connect("ny1b:27017/admin")
connecting to: ny1b:21017/admin
admin
```

### 47. 获得帮助

想知道函数接受什么参数或者记不得返回值,可以通过执行函数名不加括号来查看源码

[javaScript API](http://api.mongodb.org/js)

命令 -- listCommands 会将所有命令名称列出来

知道命令名,可以通过{commandName: 1, help: 1}来查看内置文档.

### 48. 创建启动文件

shell启动是可以运行启动文件,启动文件通常含有一组用户自定义的辅助函数, 不过也就是个普通js文件而已. 构建启动文件, 新建一个.js后缀的文件(比如startup.js),用`mongo startup.js`启动

比如, 避免意外删除数据库或者记录,可以在shell中删除一些不太安全的命令
```
// no-delete.js
delete DBCollection.prototype.drop;
delete DBCollection.prototype.remove;
delete DBCollection.prototype.dropDatebase;
```

这样删除集合时,mongo无法识别这些函数

真铁了心想删除集合,但找不到drop(),只要执行db.$cmd.findOne({drop: "foo"})就可以了.

可以建立一个详尽的函数黑名单.mongo启动时可以指定多个启动文件,可以据此实现模块化.

### 49. 自定义函数

想创造自定义函数,可以把它们定义为全局函数,或者添加到类的实例,或类本身.

```
// 需要添加一个getOplogLength函数
DB.prototype.getOplogLength = function () {
    var local = this.getSisterDB("local");
    var first = local.oplog.rs.find().sort({$natural: 1}).limit(1).next();
    var first = local.oplog.rs.find().sort({$natural: -1}).limit(1).next();
    print("total time:" + (last.ts.t - first.ts.t) + " secs");
}
```
这样连接rsA, rsB,rsC这些数据库是就有getOplogLength函数了.

要是事先已经在使用rsA, rsB,rsC 即使你添加了新函数到它们用来实例化的类中也没用. 如果连接已经开始,必须为每个实例逐个添加这一方法:
```
// 将函数存在一个变量以保存输入
var f = function () { ... }
rsA.getOplogLength = f;
rsB.getOplogLength = f;
rsC.getOplogLength = f;
```

#### 从文件加载JavaScript

在shell中用load()函数加载JavaScript库.

```
// hello.js
print("ni hao");
```

```
// in shell
> load("hello.js")
ni hao
```

### 50. 使用单个连接读取自身写入

MongoDB服务器的连接就想一个请求队列.依次发送请求,按照发送顺序出来请求. 不保证每个操作都能成功. 多个连接非原子操作可能导致数据不一致.

有连接池的驱动让一组请求通过同一个连接发送以避免"读取自己的写入"这样的矛盾.通常每个会话使用同一个连接.
