---
layout: post
title:  "在Ubuntu 14.04 上使用 Puma 和 Nginx 部署 Rails App"
date:   2017-01-02 17:52:45 +0800
categories: rails  rails_deployment
cover: '/assets/images/47152268_p0.jpg'
---

`Rails` `部署`

----------------

> 原文链接：
[how-to-deploy-a-rails-app-with-puma-and-nginx-on-ubuntu-14-04](https://www.digitalocean.com/community/tutorials/how-to-deploy-a-rails-app-with-puma-and-nginx-on-ubuntu-14-04)

### 简介

在部署自己的Rails on Ruby应用时，有很多有效的安装包可以考虑。这篇教程旨在帮助你用PostgreSQL作为数据库，在Ubuntu14.04下面使用Pumma和Ngnix部署Ruby on Rails的生产环境。

`Puma`是一个`应用服务器`(application server),与`Passenger`或者`Unicon`一样,允许你的`RAILS应用`处理`并发请求`。由于`Puma`不是为用户直接访问而设计，我们需要使用`Nginx`作为`反向代理`,用于在用户和你的应用之间缓存`请求`和`响应`。

### 要求

本教程假设你拥有一台Ubuntu 14.04 服务器，并在需要部署应用的用户下面安装了以下软件:

> * [Ruby on Rails,using rbenv] [1]
> * [PostSQL with Rails] [2]


如果你还没有以上配置，遵循以上链接的教程。我们假设你的`用户账号`为 **deploy**。

以及，这篇教程没有包含  *如何配置开发和测试环境*。如果你有这方面的需求,遵循 *[PostgreSQL with Rails tutorial][2]* 中的例子。

### 创建 Rails 应用
理想情况下，你已经有一个想要部署的Rails应用。如果是这样，你可以跳过这一节，在接下来使用合适的代替品。如果不是，第一步就是使用PostgreSQL作为数据库创建一个新的Rails应用。

这个命令将会创建一个新的Rails应用，名为`appname`.并使用PostgreSQL作为数据库。 高亮的"appname"可以随便修改:

> rails new `appname` -d postgresql

然后跳转到用户目录：

> cd `appname`

让我们花点时间创建一个`PostgreSQL用户`给你的Rails应用的生产环境。

### 创建生产数据库用户

为了让事情简单，我们把生产数据库用户名和你的应用名字保持一致。比如，如果你的应用叫做"appname",你就像这样创建PostgreSQL用户：

> sudo -u postgres createruser -s `appname`

我们想要为此数据库用户设置密码，像这样进入PostgresSQL控制台：

> sudo -u postgres psql

为数据库用户"appname"设置密码:

> password appname

输入你想要的密码然后确认。

退出PostSQL控制台：

> \q

现在我们准备好用这些数据库连接信息配置你的应用了。

### 配置数据库连接

确定你是在你的应用的`根目录`(cd ~/appname)。

用你喜好的文本编辑器打开你的应用的数据库配置文件。我们用`vi`:

> vi config/database.yml

更新`production` 段落，让它看起来像这样：

```
production:
  <<: *default
  host: localhost
  adapter: postgresql
  encoding: utf8
  database: appname_production
  pool: 5
  username: <%= ENV['APPNAME_DATABASE_USER'] %>
  password: <%= ENV['APPNAME_DATABASE_PASSWORD'] %>

```
注意数据库用户名和密码配置成通过环境变量读取,'`APPNAME`_DATABASE_USER' 和'`APPNAME`_DATABASE_PASSWORD'。这被认为是保证你的`生产密码`和`密文`(secrets)在应用代码之外的最佳实践，否则在使用类似GIT这样的版本控制系统时容易把它们暴露出去。接下来我们就会介绍 *如何配置数据库权限和环境变量*。

Save and exit.

### 安装rbenv-vars插件

在部署Rails`生产应用`(production Rails application)之前，你需要使用`环境变量`设置`生产安全密文`(production secret key)和`数据库密码`。作为一种管理`环境变量`的简单方式，可以使用 **rbenv-vars** 插件 来实时加载`密码`和`密文`到我们的应用里面。

要安装 rbenv-rars 插件，只用跳转到`.rbenv/plugins`目录然后clone it from GitHub. 比如，如果rbenv 安装在你的`home`目录，运行这些命令：

```
cd ~/.rbenv/plugins
git clone https://github.com/sstephenson/rbenv-vars.git
```

### 设置环境变量

现在 rbenv-vars 插件已经安装了。让我们来配置需要的环境变量。

首先，生成密文(secret key),用于校验单个cookie的完整性：

```
cd ~/appname
rake secret
```
copy 生成的密文(secret key),然后打开.rbenv-vars 文件：

> vi .rbenv-vars

在这里设置的任何环境变量都会被你的Rails应用读取。

> 备注： 这里实际是在你的程序根目录里新建一个.rbenv-vars 文件,然后写如环境变量

首先，设置SECRET_KEY_BASE 变量 (替换高亮部分为你自己刚刚生成并拷贝的密文)：

> SECRET_KEY_BASE=`your_generated_secret`

然后，设置APPNAME_DATABASE_USER 变量(替换高亮的'APPNAME'为你自己的应用名称，'appname'是你生产数据库的用户名)：

> `APPNAME`_DATABASE_USER=`appname`

最后，设置 APPNAME_DATABASE_PASSWORD 变量 (替换高亮的'APPNAME'为你自己的应用名称，'prod_db_pass'是你生产数据库的用户密码)：

> `APPNAME`_DATABASE_PASSWORD=`prod_db_pass`

Save and exit.

你可以查看那些环境变量被 rbenv-vars 插件设置于你的应用:

> rbenv vars

如果你改变你的密文或数据库密码，更新.rbenv-vars文件。注意保持这个文件的私有性，不要把它包含在你的公开代码库里。

### 创建生产数据库

现在你的应用已经配置好可以与你的PostgreSQL对话了。让我们来创建数据库：

> RAILS_ENV=production rake db:create

#### Generate a Controller

如果你依照的是这个例子，我们将生成一个scaffold controller 这样我们的应用就有点东西可以看了：

> rails generate scaffold Task title:string note:text

现在运行命令来更新这个生产数据库：

> RAILS_ENV=production rake db:migrate

你还需要预编译`assets`:

> RAILS_ENV=production rake assets:precompile

要测试你的应用是否工作,可以运行这个生产环境，并绑定你的服务器的公共IP (替换为你自己的服务器的公共IP地址)：

> RAILS_ENV=production rails server --binding=`server_public_IP`

现在到浏览器访问这个URL：

> http://server_public_IP:3000/tasks

如果工作正常,你将看到这个页面:

![page](https://assets.digitalocean.com/articles/rails_unicorn/tasks.png)

回到你的Rails server, Ctrl-c 停止应用。


### 安装Puma

现在准备安装Puma。

一个简单的办法是把它加入你应用的Gemfile。打开Gemfile(确定你是在你的应用的根目录)：

> vi Gemfile

在文件末尾，加入这一行：

> gem 'puma'

Save and exit.

要安装Puma，以及相关的依赖，run Bundler：

> bundle

现在puma已经安装了，不过我们还需要配置它。

### 配置Puma

配置Puma之前，你要看一下你的服务器的CPU核的数量。用这个命令可以轻易做到：

> grep -c processor /proc/cpuinfo

现在加入Puma配置到 `config/puma.rb `。打开文件：

> vi config/puma.rb

拷贝粘贴这些配置到文件里：

```
# Change to match your CPU core count
workers 2

# Min and Max threads per worker
threads 1, 6

app_dir = File.expand_path("../..", __FILE__)
shared_dir = "#{app_dir}/shared"

# Default to production
rails_env = ENV['RAILS_ENV'] || "production"
environment rails_env

# Set up socket location
bind "unix://#{shared_dir}/sockets/puma.sock"

# Logging
stdout_redirect "#{shared_dir}/log/puma.stdout.log", "#{shared_dir}/log/puma.stderr.log", true

# Set master PID and state locations
pidfile "#{shared_dir}/pids/puma.pid"
state_path "#{shared_dir}/pids/puma.state"
activate_control_app

on_worker_boot do
  require "active_record"
  ActiveRecord::Base.connection.disconnect! rescue ActiveRecord::ConnectionNotEstablished
  ActiveRecord::Base.establish_connection(YAML.load_file("#{app_dir}/config/database.yml")[rails_env])
end
```

把`workers`的数量改为你的服务器的CPU核心的数量。

Save and exit.
这会给puma配置你应用的位置，Puma的socket、logs、PIDs的位置。可以自由修改这个文件，加入其他你需要的选项。

现在创建配置文件里引用到的目录：

> mkdir -p shared/pids shared/sockets shared/log

### 创建Puma Upstart Script

让我们创建一个Upstart init script ,这样就能简单的开始和停止Puma，并确保在服务器启动时同时启动。


从 Puma GitHub库下载Jungle Upstart tool到你的`home`目录：

```
cd ~
wget https://raw.githubusercontent.com/puma/puma/master/tools/jungle/upstart/puma-manager.conf
wget https://raw.githubusercontent.com/puma/puma/master/tools/jungle/upstart/puma.conf
```

现在打开提供的puma.conf文件,这样我们能配置Puma开发用户：

> vi puma.conf

找到指定`setuid`和`setuid`的两行,然后用你的开发用户和组的名字替换"apps"。比如，如果你的开发用户叫做"deploy",这几行看起来像这样：

```
setuid deploy
setgid deploy
```

Save and exit.

拷贝 scripts 到 Upstart servives 目录：

> sudo cp puma.conf puma-manager.conf /etc/init

`puma-manager.conf` 脚本引用了 它管理的应用的`/etc/puma.conf`。 现在创建并编辑这个编录文件：

> sudo vi /etc/puma.conf

文件里的每一行就是你希望puma-manager管理的一个应用的路径。现在加入你的应用的路径. 比如：

> /home/`deploy`/`appname`

Save and exit.

现在你的应用已经配置为随服务器引导(boot time)而启动。你的应用在你的服务器reboot的时候重新启动。

### 手动启动Puma应用

要启动所有被管理的Puma应用，运行命令：

> sudo start puma-manager

或者你想使用puma Upstart script 启动单个Puma应用:

> sudo start puma app=/home/`deploy`/`appname`

可以使用`restart` 和`stop` 来控制应用：

```
sudo stop puma-manager
sudo restart puma-manager
```

现在你的Rails应用的生产环境运行在puma下了,并被`shared/sockets/puma.sock`socket监听。在你的应用被外部用户访问之前，你需要设置Nginx反向代理。

### 安装和配置Nginx

使用apt-get 安装 Nginx :

> sudo apt-get install nginx

现在打开默认服务器块：

> sudo vi /etc/nginx/sites-available/default

用下面的代码块替换文件内容。确定使用相应的`用户名`和`应用名字`替换`deploy`和`appname`部分:

```
upstream app {
    # Path to Puma SOCK file, as defined previously
    server unix:/home/deploy/appname/shared/sockets/puma.sock fail_timeout=0;
}

server {
    listen 80;
    server_name localhost;

    root /home/deploy/appname/public;

    try_files $uri/index.html $uri @app;

    location @app {
        proxy_pass http://app;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_redirect off;
    }

    error_page 500 502 503 504 /500.html;
    client_max_body_size 4G;
    keepalive_timeout 10;
}
```

Save and exit.

这个配置Nginx作为反向代理，这样HTTP请求通过Unix socket 抵达Puma应用服务器。随意修改配置到你感到满意为止。

重启Nginx使修改生效:

> sudo service nginx restart

现在你的应用的生产环境已经可以通过你的服务器的公共IP地址或者FQDN访问了。要访问我们之前创建的Tasks controller，在web浏览器里面访问：

> http://server_public_IP/tasks

你会看到和第一次测试时同样的页面，不过现在被架设在了nginx和Puma上。

### 结论

恭喜！
你已经在Nginx和Puma上部署了你的Rails on Ruby应用的生产环境。

如果你希望增强你在生产环境下的Rails应用部署的能力，你可以查看系列教程 [How To Use Capistrano to Automate Deployments](https://www.digitalocean.com/community/tutorial_series/how-to-use-capistrano-to-automate-deployments)

这个系列基于CentOS，不过对于自动部署你的应用也有帮助。



[1]: https://www.digitalocean.com/community/tutorials/how-to-use-postgresql-with-your-ruby-on-rails-application-on-ubuntu-14-04

[2]: https://www.digitalocean.com/community/tutorials/how-to-install-ruby-on-rails-with-rbenv-on-ubuntu-14-04
