---
layout: post
title:  "异常处理的设计与重构"
date:   2018-07-15 18:11:45 +0800
categories:  Refactoring Exception_handle
cover: '/assets/images/47152268_p0.jpg'
---

`Exception`

---

﻿# 异常处理的设计与重构

标签（空格分隔）：异常处理

---
[toc]
## 异常处理第一步----决定强健度等级

### 定义异常处理等级

| 项目 | 等级0 | 等级1 | 等级2 | 等级3 |
| :---: | :----: | :----: | :----: | :----: |
| 名称 |未定义(Undefined)|错误报告(Error-reporting)|状态恢复(State-recovery)|行为恢复(Behavior-recovery)|
|服务|隐式或显式失败|显式失败|显式失败|持续提供|
|状态|未知或不正确|未知或不正确|正确|正确|
|生命周期|终止或继续|终止|继续|继续|
|如何达成|NA|1.传达所有未被处理的异常 2. 在主程序中报告所有的异常| 1.错误处理(error-handling) 2. 资源清理(cleanup)|1.缺陷处理(fault-handling) 2.重试(retry,and/or) 3.设计多样性(design-diversity), 功能多样性(functional-diversity), 数据多样性(data-diversity), 时序多样性(temporal-dicersity)|
|别名|NA|快速失败(failing-fast)|弱容错(weakly-tolerant)|强容错(strong-tolerant)|

#### **等级0: 未定义**

未定义表示当某个服务(service)发生错误的时候,可能会让调用者知道错误发生,也可能会假装没事(failing implicitly or explicitly). 无法知道服务是否成功达成任务. 错误发生时,服务处于不明或是错误状态. 异常发生时,系统可能终止, 也可能继续执行.

#### **等级1: 错误报告**

错误报告(error-reporting)代表当某个服务发生错误的时候,一定要让调用者知道,绝对不难假装没事(failing explicitly). 服务调用者可以确切知道它是否成功达成任务. 错误发生时,若没有执行"错误恢复(error recovery)"动作, 系统可能处于不明或者错误状态. 当异常发生时,系统必须要终止执行,因为此时状态已经不明了,继续执行下去可能会让整个系统错的更加离谱.
达到错误报告强健度等级,就是把所有的异常都往外丢,然后在主程序(整个系统最外层的那个程序)捕获所有的异常并报告给使用这或开发人员知道. 错误报告(failing-fast)

#### **等级2: 状态恢复**

状态恢复(state-recovery)要求当某个服务失败的时候,一定要让调用者知道,同时要求当错误发生之后，服务必须保证系统仍然处于正确状态。由于整个系统的状态还是正确的，因此，异常发生之后，系统仍然可以继续执行。
达成状态恢复， 首先是错误处理(error-handling),让系统恢复多一个正确的状态。其次是释放资源(cleanup)。
状态恢复又称为弱容错(weakly tolerant)

#### **等级3： 行为恢复**

行为恢复要求当错误发生之后，服务必须保证还是处于正确的状态。由于整个系统的状态还是正确的，因此，异常发生时，系统仍然可以继续执行。
达到等级3，除了要做到等级2的错误处理(error handling)和资源清理(cleanup)之外，为了不让下次执行再度失败，需要先启动缺陷处理(fault handling)以排除造成失败的原因。造成错误的缺陷排除之后，便可以套用重试(retry)与设计多样性(design diversity)、功能多样性(functional diversity)、数据多样性(data diversity)、时序多样性(temporal diversity)等设计技巧，尝试继续提供服务。行为恢复又称为"强容错"(strong tolerant)

#### **怎么用**

1. 默认所有函数强健等级1。 开发阶段及时发现问题并修复。
2. 特定函数(数据库处理)，等级2.
3. 不会特别要求函数要做到行为恢复。

## 强健度等级1 ---- 错误报告的实现策略

错误报告的基本精神是必可以忽略异常。

### 不可忽略异常

绝大部分情况下，不要用一个空的catch块捕捉异常并忽略它。
```
catch (IOException e) {
// 忽略异常是不好的错误示例
}
```
捕捉异常之后输出，效果几乎等同忽略异常， 程序执行时，使用者很难察觉到这些错误消息。
```
catch (IOException e) {
e.printStackTrace(); // 打印异常效果几乎等同忽略异常
}
```

### 自动传递

程序中不要捕获未查异常(unchecked exception),让它自动往外传递。
使用`UnhandledException`传递已查异常针对未查异常的传递，定义一个`RuntimeException`的子类`UnhandleException`, 将捕捉到的未查异常串接在`UnhandleException`上，然后丢出`UnhandleException`代表该异常还没有被处理。
```
catch (IOException e) {
throw new UnhandleException(e);
}
```

### 不要在写入日志文件后在丢出异常

伤害性能(同个异常被记录多次)， 还造成日后除错困扰。
```
catch (IOException e) {
logger.error("找不到系统文件", e);
throw new UnhandleException(e); // 写入日志文件后不要在丢异常
}
```
### 建立安全网

在程序最外层(主程序以及每一个线程)统一使用一个try语句建立安全网，捕捉所有异常以避免程序异常终止。此时，除了可以把异常转换成错误信息，还能统一写入日志文件。 这样就不用在所有函数里面重复捕捉、写日志文件并重新丢出相同的异常。

## 强健度等级2 ---- 状态恢复的实现策略

状态恢复需要错误处理与资源清理。两者都是为了让系统保持正常。
- 错误处理关注系统内部的状态。例如数据结构、对象以及全局变量的状态，文件或数据库内容是否正确。
- 资源清理强调"外部资源"(操作系统或执行环境)的清理，以避免资源泄漏。

### 错误处理

错误处理目的是移除错误造成的不正确状态，将系统恢复到一个没有错误的状态。分为*向后处理(backward recovery)*和*向前处理(forward recovery)*。

向后处理指当错误发生时，系统恢复到错误发生之前所保留的状态。需要借助不被系统失败所影响的稳定存储装置来保留状态。

- 基于状态的： 存储一个完整的正确状态，错误发生后丢弃整个错误状态，以所存储的正确状态来取代。 检查点、快照、时光机等等。
- 基于操作的： 不采用存储完整正确状态的方式，改以存储改变状态的事件或操作。错误发生后，利用这些存储下来的状态改变记录，反向取消原本的操作以达到状态复原的效果。

### 基于状态的向后恢复

考虑帮`writeFile`函数增加向后恢复。在执行`writeFile`函数前，先制作一个检查点。执行`writeFile`函数的过程中，因为某个缺陷(fault)而导致错误(error)产生，此时执行状态恢复(restore)动作，使用刚刚制作的检查点来恢复系统状态。`writeFile`无法达到原先规格所设定的功能，因此其执行结果为失败，但是因为做了向后恢复，所以最后系统状态处于正确状态。

### 基于操作的向后恢复

以操作为基础的向后恢复，是采取撤销(undo)原本操作的方式来还原系统的状态。
假设某游戏被黑客入侵，玩家物品被盗。此时系统处在不正确的状态。由于整个游戏一直在改变，系统并没有存在一个合适的检查点可以用来执行状态还原。如果平常玩家交易和玩家状态改变都有妥善记录在日志文件中，则可以利用日志文件的数据反向回推每个玩家的正确状态。
用这种方法还原状态，系统必须记录足够的额外信息。常见方式有使用**冗余数据**和**冗余函数**来达成状态还原。每次事务数据或玩家状态改变，都必须写入到日志文件，日后才可以利用这个日志文件来恢复数据。
或者套用*Command*设计模式， 将操作包装成独立的类，在该类中提供`do`和`undo`两个动作相反的函数。通过`undo`函数执行状态还原。

### 向后恢复的优点

首先，只要错误没有对向后恢复机制发生影响，就可以还原fault造成的各种不预期错误。
其次， 向后恢复是一种通用的状态恢复方法，与应用程序或应用领域无关。实现向后恢复不需要特别研究错误发生的原因。
最后， 向后恢复适合复原瞬时故障造成的错误。

### 向后恢复的限制

- 耗费资源。
- 保存与还原系统状态的当下，会要求系统挂起，降低或拉长系统响应。

### 资源清理

- 内存管理
- 资源释放

## 强健度等级3 ---- 行为恢复的实现策略

行为恢复异常发生之后， 软件组件还可以继续提供正常的服务，对外部来说， 就好像这个异常根本没有发生。
要做到行为恢复， 需要考虑缺陷处理(fault handling)与重试(retry)，从容错设计来看，实行向前恢复的状态恢复方式，也可以达到等级3.

### 缺陷处理

- 诊断： 鉴定与记录错误发生的原因，包含错误发生的位置与种类
- 隔离： 将失败的组件从系统中隔离，以防止后续的操作继续使用这个失败的组件
- 重新配置： 如果系统有冗余或是备用的组件，则将系统重新配置以便使用冗余或者备用组件。或重新指派工作，让没有发生问题的组件来取代被隔离的组件。
- 重新初始化： 确认重新配置之后的系统可运作之后，重新设置系统以便采用这个新的配置

### 重试

重试结果能否成功，很大程度受到缺陷处理的重新配置所影响。
瞬时缺陷或间歇缺陷，*重试原本实现* 即可。永久缺陷，重新配置阶段就必须使用替换的组件或新的执行路径来代替有缺陷的组件，即*重试替代方案*。

- 设计多样性： 同一个规格设计与实现多个功能相同的版本。
- 功能多样性： 采用不同的输入与不同的设计、实现方式达到相同的功能。
- 数据多样性： 函数执行失败有时是因为输入参数有问题，提供不同的数据。
- 时序多样性： 系统可能因为性能或时序的问题导致函数执行失败，调整一下函数执行的时间点，就可能解决问题。

### 向前恢复

N 版本程序设计。
搭配日志文件，应用在数据库系统中。事务日志。

## 异常类的设计与使用技巧

### 用哪里出了问题来命名， 而不是看谁丢出异常

### 将底层异常转成高层所理解的异常

不要将低层的实现异常直接跨层传递给上层，否则，会被底层的实现细节给绑住，造成不必要的依赖型。

### 同构型异常

采用异常来代表失败，如果一个函数因为多种原因造成失败，该函数丢出多种异常。可以设计一个新异常类，用这个异常类代表同一个类所有函数可能抛出的异常。

### 未处理异常

实现函数功能时，遇到已查异常，但是当时只是想实现正常逻辑，并不想要处理异常行为。不可以用空的`catch`块捕捉异常并忽略，应该定义一个属于`RuntimeException`的`UnhandleException`， 再将捕捉到的已查异常串接到`UnhandleException`， 最后抛出`UnhandleException`。

### 通道异常

有时，一个函数无法声明自己要抛出什么样的已查异常(checked exception). 比如，要实现别人定义的回调函数或Command设计模式， 如果原本的回调函数或Command没有声明会抛出任何异常，你的实现也就无法抛出任何异常。

因此，定义一个继承自`RuntimeException`的`TunnelingException`， 抛出这个`TunnelingException`，并把原本想抛出的异常串接到这个`TunnelingException`上。

```
try{
    CommandExecutor executor = new CommandExeception();
    executor.execute(new Runnable() {
        public void run() {
            System.out.println(
                "Encounter SQLException"
);
            );
            throw new TunnelingException(new SQLException());
}
        }
    });
} catch (TunnelingException e) {
    if (e.getCause() instanceof SQLException) {
        // 处理 SQLException
    }
}
```

### 异常包装

若一个函数声明它会抛出同构型异常， 则原本发生的异常串接到同构型异常上面。

客户端程序捕捉到同构型异常时， 可以通过被打包的异常对象，知道异常发生的根本原因。

### 聪明异常

捕捉到异常后，有时需要依据异常发生原因而设计不同的异常处理方式。
可以设计一个枚举类来代表错误发生的原因。在异常类中包含这个枚举类，只要一个异常对象就可以代表多种异常情况。

```
catch (java.sql.SQLException e) {
    rollback(con);
    if (e.getErrorCode() == EXTERNAL_ROUTINE_EXCEPTION) {
        compensate();
}
    }
    throw new AggregationException(e, sql);
}
```

### 异常层次结构

异常类继承结构，让更精确的异常类继承同构型异常。接口声明丢出同构型异常， 实现上抛出异常子类。

异常层次结构和聪明异常都是一种用来提供详细错误数据的方法，前者通过继承，后者则通过包含一个错误数据列表对象。异常层次结构直接使用不同的catch块来捕捉异常，ug'qx聪明异常只用一个catch块但要在块里用if条件依据列举对象的值来判断错误原因的做法。

错误原因不是很多，或是不同错误原因的处理方式个不相同，考虑使用异常错误层次结构的方法。

## 终止或继续

- 终止： 结束目前执行中的函数并抛出异常让调用者处理
- 继续： 继续目前执行中的函数， 对于执行过程中发生的异常，先暂时写到日志文件或是以收集参数的方式回传给调用者。

### 执行批处理

```
public void runBatchJob(List<Job> aList, ErrorCollector collector) {
    for (Job job: aList) {
try {
        try {
            job.execute();
        } catch(Exception e) {
            collector addError(e);
}
        }
    }
}

public interface ErrorCollector {
    List<Exception> getErrors();
    void addError(Exception error);
    void clear();
    int size();
}
```
ErrorCollector 是收集的实现之一。负责收集错误数据。

### 执行周期性或重复性工作

```
public void run() {
    while(Thread.currentThread().isInterrupted()) {
        try {
            Task task = queue.task();
            task.execute();
        } catch(InterruptedException ex) {
            Thread.currentThread().interrupt();
        } catch(Exception e) {
            logger.error(e);
        }
    }
}
```

除非`InterruptedException`通知线程结束，否则`run`函数即使发生异常也一直执行

## 异常处理坏味道

### 返回码

使用返回码的问题，首先， 处理正常逻辑的程序和处理异常逻辑的程序交错在一起，导致程序不容易阅读及更改。 其次， 开发人员很可能会忽略对于返回码的检查，因而导致错误被忽略，降低系统的强健度且增加除错的难度。

```
public int withdraw(int amount) {
    if (amount > this.balance) {
        return -1;
    } else {
        this.balance = this.balance - amount;
        return this.balance;
    }
}

public void useWithdraw () {
    int balance = withdraw(500);
    if (-1 == balance) {
        // 错误处理
    } else {
        // 执行正常逻辑
    }
}
```

### 忽略已查异常

忽略异常等于隐藏潜在问题，会降低系统强健度且增加除错难度。

```
public void doIt () {
    FileInputStream fis = null;
    try {
        fis = new FileInputStream(new File("aFileName"));
    } catch (FileNotFoundException e) {
        // 忽略它
    } finally {
        close(fis);
    }
}
```

### 忽略异常

> 忽略异常等于隐藏潜在问题，会降低系统强健度且增加除错困难度

```
public void noExceptionThrown () {
    try {
        // 可能会抛出异常的正常程序逻辑
    } catch (Throwable e) {
        // 捕捉并忽略所有异常
    }
}
```

### 未被保护的主程序

未被捕捉的异常一直往上传递，最终转到主程序或线程上。如果主程序或线程没有捕捉由下转递至自己的异常，则主程序或线程会意外地终止执行。

```
static public void main (String[] args) {
    MyApp myapp = new MyApp();
    myapp.start();
}
```

### 空的异常处理程序

```
catch (FileNotFoundException) {
    e.printStackTrace(); // Dummy Handler
} catch (IOException e) {
    System.out.printIn(e.getMessage()); // Dummy Hnndler
}
```

用户或开发人员并不容易直接观看到输出至控制台的异常信息。 此外， 这类异常处理程序并没有考虑修复程序状态的问题，因此，可能导致程序状态不正确而无法继续运作下去。

> 空的异常处理程序造成一种异常已经被妥善处理的假象。

### 嵌套Try语句

复杂的程序结构，导致程序难以阅读、测试及维护。

```
try {
    in = new FileInputStream("aFile");
} catch (IOException e) {
        // 处理异常
} finally {
    try { // 嵌套Try语句
        if (in != null) {
            in.close();
        }
    } catch (IOException e) {
        // 将异常写入日志
    }
}
```

### 当成备胎的异常处理程序

把catch块当成try块的「备胎」， 当try块里面的实现发生异常，则执行catch块里面的代替方案，结构如下：

```
try {
    // 主要实现
} catch {
    // 替代方案
}
```

这种异常处理方法相当于 「采用替代方案重试」(retry with alternatives), 方法本身没问题。
但是，将替代方案写在catch块里面， 则会导致只能重试一次，如果想要多次重试，势必要在catch块里面再放置多个try语句，因而形成嵌套try语句坏味道。

这样的catch块混合错误处理、缺陷处理与正常逻辑替代方案实现。 程序结构更加难以理解与维护。

### 粗心的资源清理


粗心的资源清理表示资源没有被正确释放，会导致资源耗尽并降低系统的稳定性。

```
try {
    FileInputStream fis = new FileInputStream(new File(aFileName));
    fis.close(); // 错误
} catch (IOnterruptedException ex) {
    // 处理异常
}
```

或者

```
try {
    FileInputStream fis = new FileInputStream(new File(aFileName));
} catch (IOException e) {
    fis.close(); // 错误
    // 处理异常
}
```
第8行发生异常，则第9行就不会被执行。
```
public void carelessCleanup(String aFileName) throws IOException {
    FileInputStream fis = null;
    DataInputStream dis = null;
    try {
        fis = new FileInputStream(new File(aFileName));
        dis = new DataInputStream(fis);
    } finally {
        fis.close();
dis.close(); // 如果上面一行发生异常，就执行不到
}
}
```

## 用异常代替错误码

```
public synchronized int withdraw(int amount) {
    if (amount > this.balance) {
        return -1;
    } else {
        this.balance = this.balance - amount;
        return this.balance;
    }
}
```

改

```
public synchronized int withdraw(int amount) throws NotEnoughMoneyException {
    if (amount > this.balance) {
        throw new NotEnoughMoneyException;
    }
    this.balance = this.balance - amount;
    return this.balance;
}
```

## 以未查异常取代忽略已查异常

捕捉了已查异常(checked exception) 但什么事都没做。

=>

将所捕捉的已查异常转成事先定义好的未查异常UnhandledException,然后再将其抛出。
```
} catch(IOException e) {
    // ignoring the exception
}
```

=>

```
catch (IOException e) {
    throw new UnhandledException(e);
}
```

## 以重新抛出异常代替空的处理程序

采用空的异常处理程序(Dummy Handler)来处理异常。

=>

移除Dummy handler. 将捕捉到的异常转成事先定义好的UnhandledException，属于未查异常，然后再抛出。
```
catch (IOException e) {
    e.printStackTrace();
}
```

=>

```
catch (IOException e) {
    throw new UnhandledException(e);
}
```

## 使用最外层Try语句避免意外终止

未被捕捉的异常最终传递到最外层的组件， 造成应用程序意外终止。

=>

将最外层组件以一个try语句包住，捕捉所有异常，然后将其显示或记录到日志文件中。

```
static public void main (String[] args) {
    // 主程序
}

static public void main (String[] args) {
    try {
        // 主程序
    } catch (Throwable e) {
        // 显示错误信息并且记录到日志文件中
    }
}
```

## 以函数取代嵌套的Try语句

程序中存在嵌套的try语句

=>

将嵌套try语句抽离到一个新的函数，让该函数的名称体现其目的。
```
finally {
    try {
        if (in != null) in.close();
    } catch (IOException e) {
        // log the exception
    }
}
```

改

```
finally {
    cleanup(in);
}

private void cleanup (Closeable cls) {
    try {
        if (cls != null) cls.close();
    } catch (IOException e) {
        // log the exception
    }
}
```

## 引入Checkpoint类

try块改变了应用程序的状态。try块发生了异常，希望确保应用锁程序依然保持在正确的状态。

=>

新增一个checkpoint类来管理应用程序状态，该类具有保存从动态、恢复状态和丢弃状态等功能

```
public void moveFiles(String srcFolder, String destFolder) throws IOException {
    try {
        // 复制srcFolder所有文件到destFolder
        // 可能发生IOException
    } finally {
        // 释放资源
    }
}
```

=>

```
public void moveFiles (String srcFolder, String destFoler) throws IOException {
    folerCheckpoint fscp = null;
    try {
        fscp = new FolerCheckpooint();
        fscp.extablish(srcFolder);
        // 复制 srcFolder 所有档案到 destFolder,
        // 可能会发生 IOException
    } catch (Exception e) {
        fscp.restore();
        throw e;
    } finally {
        fscp.drop();
        // 释放资源
    }
}
```

步骤：

创建 checkpoint 类
- 新增establish、restore和drop三个函数
- 依据所有保存的状态，分别实现establish和restroe、drop
- 编译测试

使用checkpoint类
- 在try块外面声明并产生checkpoint类的实例
- 在try块中， 尚未改变所要保存的状态之前，调用checkpoint类的extablish函数来保存数据
- 在catch块中，执行checkpoint类的restroe函数来恢复数据
- 在catch块中，执行checkpoint类的drop函数来清除数据
- 编译测试

## 引入try块

把catch块当作try块的备胎， 在其中所提供的代替方案可能失败，进一步抛出异常

=>

把catch块里面的代替方案移到try块，修改程序结构，使其在异常发生之后可以重新执行try块

```
public User readUser (String name) throws ReadUserExeption {
    try {
        return readFromDatabase(name);
    } catch (Exception e) {
        try {
            return readFromLDAP(name);
        } catch (IOException e) {
            throw new ReadUserException(ex);
        }
    }
}
```

=>

```
public User readUser(String name) throws ReadUserException {
    final int maxAttempt = 3;
    int attempt = 1;
    while(true) {
        try {
            if (attempt <= 2) {
                return readFromDatabase(name);
            } else {
                return readFromLDAP(name);
            }
        } catch (Exception e) {
            if (++attempt > maxAttempt) {
                throw new ReadUserException(e);
            }
        }
    }
}
```

## 一个函数只能有一个Try语句

> 函数应该只做一件事，它们应该把这件事做好应该只做这件事。

难点在于如何界定『一件事』的范围。从异常处理的角度来看，套用『一个函数只能有一个try语句』这个做法，可以协助开发人员思考一个函数是只做一件事，还是负担了太多责任。

```
public void setupMessageV2(DataInputStream aIS) throws InvalidPacketExeption {
    int length = 0;
    try {
        length = ais.readInt();
        setMessageLength(length);
    } catch (IOException e) {
        throw new InvalidPacketException("读取封包长度错误", e);
    }

    try {
        byte[] messageBody = new byte[length];
        aIS.readFully(messageBody);
        setMessageBody(new String(messageBody));
    } catch (EOFException e) {
        throw new InvalidPacketException("封包长度少于封包表头数据所示", e);
    } catch (IOException e) {
        throw new InvalidPacketException("读取封包内容错误", e);
    }
}
```

=>

```
public void setupMessageV3(DataInputStream aIS) throws InvalidPacketExeption {
    int length = readMessageLength(aIS);
    byte[] messageBody = readMessageBody(length, aIS);
    setMessageLength(length);
    setMessageBody(new String(messageBody));
}

private int readmessageLength(DataInputStream aIs) throws InvalidpacketException {
    try {
        int length = aIS.readInt();
        return length;
    } catch (IOException e) {
        throw new InvalidPacketException("读取封包长度错误", e);
    }
}

private byte[] readMessageBody(int aLength, DataInputStream aIS) throws InvalidPacketException {
    try {
        byte[] messageBody = new byte[aLength];
        aIS.readFully(messageBody);
        return messageBody;
    } catch (EOFException e) {
        throw new InvalidPacketException("封包长度少于封包表头数据所示", e);
    } catch (IOException e) {
        throw new InvalidPacketException("读取封包内容错误", e);
    }
}
```
