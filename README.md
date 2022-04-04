# 通用查询服务  
## 该项目适合简单的增删改查服务的自动生成,是用 ***Nodejs*** 写的  
---
## 应用场景,比如前端需要展示一个SQL的查询结果,只需要配置一下查询的SQL,就可以根据相应的SQL_ID,调用服务得到需要的数据.不需要后台再写接口
---
### 数据库,我用的是mySQL-8.0.2版本,创建数据的语句和相关表的SQL我都放在项目里面了,需要的朋友,可以在本地搭建环境.
--- 
### 下面介绍一下基本的使用方法

* 配置SQL语句(对应的数据字段sql_content):
  1. SQL里面的"?"号,代表需要从前台传入的参数,必须要是英文状态下的问号;
  2. SQL里面的"[]"中括号里面的内容,代表这个条件,如果前台传了参数,就生效,如果前台不传,则不生效
  ```sql
  select * from t_category where cancel_sign='N' 
  and category_name like ? 
  [ and category_id = ? ]
  [ and category in ? ]
  order by series DESC
  ```
* 配置SQL的参数(对应的数据库字段sql_params):
  1. 参数里面的对象属性,必须要和上面的SQL语句里面的问号一一对应.
  2. 参数里面的"name"属性的值,代表从前台传过来的参数名称,可以和数据库的字段一致,也可以不一致,但必须和前台传过来参数名称一致.
  3. 参数里面的"musthave"属性,代表是否是必传参数,一般情况下,如果这个条件,写在中括号里面,musthave一般为false不必填,写在中括号外面的条件,一定要为true.
  4. 参数里面的"qtype"参数,代表SQL语句需要特殊处理的情况,比如,语句里面用到了like,"qtype"参数就传"like",这样后台在处理的时候,会自动在入参的首尾加上"%"; 如果条件是in,则前台传入的参数就应该是以 ***$\color{red} {逗号分隔的字符串} $*** ,后台会自动处理
  ```json
  [
    {"name": "category_name","musthave": true,"qtype":"like"},
    {"name": "id","musthave": false},
    {"name": "category","musthave": false,"qtype":"in"}
  ]
  ```
### 如果项目很大的时候,我们通常会选择分库存储数据,比如主数据库,和业务单据库是分开存放的,这时如果你在业务库,需要查询单据的创建人是谁,而业务库一般只会存储人员的ID,需要从主数据库里面去根据ID查到人员的姓名,再一起返回,这时,我们的子查询就派上用场了

### ***子查询的作用:把主查询查到的结果,做为入参,去调用子查询的SQL,并把查到的内容一起合并到主查询结果里面,一起返回给前端***

* 配置子查询(在主查询对应的数据库字段sub_sql_id里面写了子查询的sql_id,这样就配置完成了,下面看一下子查询的配置方法),
  1. 子查询的应用场景是根据主查询的结果,再去另外的数据库去关联相关的内容,并一起返回的,所以子查询的返回结果只能是一条数据,或是空数据,SQL的写法如下

    ```sql
      select create_name from (
        select name as create_name from t_user where cancel_sign='N' and id = ?
      union 
      select '') A limit 1
    ```
  2. 配置子查询的参数,和主查询相似,只是这里要特别注意: ***这里的"name"属性的值,是主查询必须返回的字段***
    ```json
      [
        {"name": "create_user","musthave": true}
      ]
    ```
* 配置数据库,刚刚上面提到了多数据源,所以通用查询里面有一个字段是数据源的配置 jdbc_name.  
***这里的数据源名称,是根据项目里面的 db.js 里面的定义的,如果使用者有多个数据库,可以修改这个文件,以确定每一条SQL语句是连接哪个数据库来查询的***