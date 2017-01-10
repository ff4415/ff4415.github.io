---
layout: post
title:  "在Ubuntu 14.04 下使用PostgreSQL部署Ruby on Rails"
date:   2017-01-10 17:16:45 +0800
categories: rails  rails_deployment
---

在Ubuntu 14.04 下使用PostgreSQL部署Ruby on Rails

 Rails 部署

---

> 原文链接： [How To Use PostgreSQL with Your Ruby on Rails Application on Ubuntu 14.04](https://www.digitalocean.com/community/tutorials/how-to-use-postgresql-with-your-ruby-on-rails-application-on-ubuntu-14-04)

### 简介

Ruby on Rails 使用sqlite3 作为默认数据库。在很多情况下sqlite3都很好用，不过也可能会不满足你的应用。如果你的应用要求可扩展性，集中化，可控性(或者其它特性)等等由客户端/服务端SQL数据库，比如PostgreSQL或MySQL提供的特性。你就需要执行一些额外的步骤去搭载并运行它们。

此教程展示如何在Ubuntu 14.04服务器上建立一个Ruby on Rails的开发环境，来让你的应用程序使用PostgreSQL数据库。首先，我们简述如何安装和配置PostgreSQL,然后我们会展示如何创建一个使用PostgreSQL作为数据库服务器的rails应用程序。

### 预备条件

此教程要求预先有一个工作的Ruby on Rails 开发环境。如果你还没有搭建这样一个环境，可以可以遵循以下教程: [ How To Install Ruby on Rails with rbenv on Ubuntu 14.04.](https://www.digitalocean.com/community/tutorials/how-to-install-ruby-on-rails-with-rbenv-on-ubuntu-14-04)

你还需要有superuser权限，或`sudo`账户，如此你才能安装PostgreSQL数据库软件。

如果你准备就绪，那么我们开始安装PostgreSQL.

### 安装 PostgreSQL

如果你还没有安装好的PostgreSQL,那么照着下面来：

首先，更新apt-get:

`$ sudo apt-get update`

然后安装PostgreSQL和它的开发库:

`$ sudo apt-get install psotgresql postgresql-contrib libpq-dev`

PostgreSQL安装好了，不过你还需要创建一个新的数据库账号来给你的Rails应用程序使用。

### 创建数据库账号

用以下命名创建一个PostgreSQL superuser 账号(把pguser替换为你自己的账号):

`$ sudo -u postgres createuser -s pguser`

如果你要为数据库账号设置一个密码，使用以下命令进入PostgreSQL控制台: 

`$ sudo -u postgres psql`

PostgreSQL控制台由一个`postgres=#`提示符标识，输入以下命令给你创建的数据库账号设置密码:


`postgres=# \password pguser`

输入你想要的密码，然后确认。

现在使用以下命令退出PostgreSQL控制台:

`postgres=# \q`

接下来我们来创建 Rails 应用程序。


### 创建新的 Rails 应用

在你的home目录创建新的  Rails 应用。使用`-d postgresql` 选项 来设置PostgreSQL作为数据库, 注意替换 *appname* 为你自己应用的名字:

```
$ cd ~
$ rails new appname -d postgresql
```

然后进入应用程序目录:

`$ cd appname`

下一步是配置应用的数据库联接。


### 配置数据库联接

你先前创建的 PostgreSQL 账号 将用来 创建你应用程序的测试和开发环境数据库。我们需要给你的应用程序配置适当的数据库设置。

打开你的应用程序的数据库配置文件:

`$ vi config/database.yml`

在`default`段落，找到"pool: 5"这一行，然后在这行下面加上以下几行(注意把 *pguser* 和 *pguser_password* 替换成你自己的PostgreSQL账号和密码):

> config/database.yml excerpt
```
  host: localhost
  username: pguser
  password: pguser_password
```

保存然后退出。

### 创建应用程序数据库

使用 rake 命令创建你的应用程序的 `development`和`test`数据库:

`$ rake db:create`

这将会在你的PostgreSQL服务器上创建两个数据库。例如，如果你的应用程序名字为"appname",那么创建的数据库就会叫做"appname_development" 和 "appname_test".

如果在这里返回一个error，重读前面的章节(配置服务器联接)确保`database.yml`下面的`host`,`username`和`password`设置正确。确定数据库信息设置正确后，尝试重新创建应用程序数据库。

### 测试配置

测试你的应用程序是否能使用PostgreSQL最简单的方式就是运行它。

比如，运行开发环境(默认的),使用以下命令:

`$ rails server`

这将会在 localhost port 3000下面运行你的Rails程序.

如果你的Rails程序在远程服务器，而你想通过web浏览器访问它，可以把程序绑定到你的服务器的一个公网IP地址。首先，查看服务器的公网IP，然后使用`rails server`命令(把server_public_IP替换成你自己的服务器IP):

`$ rails server --binding=server_public_IP`

现在你就可以通过浏览器里在服务器的公网IP地址下的3000端口访问你的Rails应用程序了:

> Visit in a web browser:

`http://server_public_IP:3000`

如果你看到了"Welcome aboard" Ruby on Rails 页面，那么你的程序就配置成功并且连接到PostgreSQL数据库了。


### 结论

现在你可以在 Ubuntu 14.04 下面用PostgreSQL作为数据库运行 Ruby on Rails 程序的开发环境了。

Good luck!