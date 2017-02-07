---
layout: post
title:  "在Ubuntu 14.04 上使用 rbenv  安装 Ruby on Rails"
date:   2017-01-20 20:31:45 +0800
categories: rails  rails_deployment
cover: '/assets/images/47152268_p0.jpg'
---

`Rails` `部署`

-----------------------------------

> 原文链接： [How To Install Ruby on Rails with rbenv on Ubuntu 14.04](https://www.digitalocean.com/community/tutorials/how-to-install-ruby-on-rails-with-rbenv-on-ubuntu-14-04)

### 简介

Ruby on Rails 是一个非常流行的开源web框架，提供了用Ruby编写web应用的极佳途径。

此教程展示如何使用rbenv在Ubuntu 14.04 上安装Ruby on Rails，为你提供一个开发Ruby on Rails 应用程序的稳定环境。rbenv提供了一个方便途径来安装和管理多个Ruby版本，而且相比RVM要更简单以及更少侵入(less intrusive)。这将帮助你确保用以开发的Ruby版本匹配你的生产环境。

### 预备条件

安装rbenv之前，你需要有一台Ubuntu 14.04 服务器的**superuser**权限。如果你需要自己设置，请依据此教程的1~3步骤: [Initial Server Setup on Ubuntu 14.04](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-14-04)

当你满足了预备条件，我们就可以继续安装rbenv了。

### 安装 rbenv

现在来安装rbenv，我们使用它来安装和管理Ruby 安装包。

首先，更新 apt-get:

`$ sudo apt-get update`

使用apt-get安装rbenv和Ruby依赖:

`$ sudo apt-get install git-core curl zlib1g-dev build-essential libssl-dev libreadline-dev libyaml-dev libsqlite3-dev sqlite3 libxml2-dev libxslt1-dev libcurl4-openssl-dev python-software-properties libffi-dev`

然后我就可以安装rbenv了。最简单的方法就是使用Ruby用户来运行以下命令:

`$ cd`
`$ git clone git://github.com/sstephenson/rbenv.git .rbenv`
`$ echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bash_profile`
`$ echo 'eval "$(rbenv init -)"' >> ~/.bash_profile`
`$ `
`$ git clone git://github.com/sstephenson/ruby-build.git ~/.rbenv/plugins/ruby-build`
`$ echo 'export PATH="$HOME/.rbenv/plugins/ruby-build/bin:$PATH"' >> ~/.bash_profile`
`$ source ~/.bash_profile`

> 注意： 在Ubuntu Desktop版本里，要把以上代码块里面的`.bash_profile`都替换为`.bashrc`。

以上将会把rbenv安装到你的home目录，并设置了相应的环境变量使rbenv对应到可用的Ruby版本。

现在来安装Ruby。

### 安装 Ruby

使用rbenv之前，关心一下哪个Ruby版本是你想要安装的。我们这里要安装的文章写作时的最新版本，Ruby 2.2.3 。 你可以到[ Ruby Downloads page](https://www.ruby-lang.org/en/downloads/) 查询一下Ruby的最新版本。

作为Ruby用户登录，使用以下命令安装:

`$ rbenv install -v 2.2.3`
`$ rbenv global 2.2.3`

`global`子命令设置所有shell默认使用的Ruby版本。如果你想要安装并使用别的版本，简单运行rbenv命令跟个版本号就可以了。

以下命令效验Ruby已经正确安装:

`$ ruby -v`

很可能你不想要Rubygems给你安装的每个gem生成一堆的本地文档。这会拉长安装过程。想要关闭，运行这个命令:

`$ echo "gem: --no-document" > ~/.gemrc`

你也可能想要安装bundle gem,来管理你的应用程序依赖:

`$ gem install bundler`

现在Ruby安装好了，接着来安装Rails。

### 安装 Rails

以同一个用户登录，使用以下命令安装Rails(可以用 `-v` 选项指定版本号):

`$ gem install rails`

任何时候，当你安装新版本Ruby或者提供命令的gem之后，你需要运行`rehash`子命令。这将会给rbenv识别到的所有Ruby可执行文件安装*shims*，这样你才能使用这些可执行文件:

`$ rbenv rehash`

通过打印版本号来效验Rails已经正确安装，命令如下:

`$ rails -v`

如果安装正确，你将看到已安装Rails的版本号。

### 安装 Javascript Runtime

以下Rails特性，比如Asset Pipeline, 依赖Javascript runtime 。通过安装Node.js来提供这些功能:

将 Node.js PPA 加入 apt-get:

`$ sudo add-apt-repository ppa:chris-lea/node.js`

然后更新apt-get并安装 Node.js 程序包:

`$ sudo apt-get update`
`$ sudo apt-get install nodejs`

恭喜! Ruby on Rails 现在安装到你的系统了。

### 可选步骤

如果想改进安装步骤，这里给几个建议:

#### 配置 Git

一个好的版本控制系统是程序编码的基础。参考安装Git教程的[ How To Set Up Git ](https://www.digitalocean.com/community/tutorials/how-to-install-git-on-ubuntu-14-04#how-to-set-up-git)章节。

#### 安装数据库

Rails使用 sqlite3 作为默认数据库。这可能不能满足你的需求。你可能会需要安装一个 RDBMS ，比如 MySQL 或 PostgreSQL 这样的。

例如，如果你要安装 MySQL 作为数据库，用 apt-get 安装 MySQL 如下:

`$ sudo apt-get install mysql-server mysql-client libmysqlclient-dev`

然后安装 `mysql2` gem,如下:

`$ gem install mysql2`

然后就可以在你的Rails应用程序中使用 MySQL 了。 注意确保 MySQL 和你的 Rails 程序配置正确。

### 创建测试应用(可选)

如果你想要确定你的 Ruby on Rails 是否顺利的安装好了。你可以快速创建一个测试程序来测试一下。为了简单，我们的测试程序使用 sqlite3 作为数据库:

在home目录创建一个新Rails程序：

`$ cd ~`
`$ rails new testapp`

然后进入程序目录:

`$ cd testapp`

创建 sqlite3 数据库:

`$ rake db:create`

如果你不知道服务器的公共IP地址，可以使用如下命令查看:

`$ ip addr show eth0 | grep inet | awk '{ print $2; }' | sed 's/\/.*$//'`

拷贝 IPv4 地址到剪切板，使用以下命令启动你的Rails程序(用拷贝的IP地址替换 **server_public_IP** ):

`$ rails server --binding=server_public_IP`

如果工作正常，你的程序会运行在服务器的公共IP的端口号3000下面。使用web浏览器访问如下:

`http://server_public_IP:3000`

如果看到Rails的 "Welcome aboard" 页面，说明你的Ruby on Rails 程序工作正常！

### 结尾

现在你可以开始开发新Ruby on Rails 程序了。Good luck!
