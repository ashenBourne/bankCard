# bankCard

根据银行卡号回显银行卡信息：银行卡所在行，卡类型等;

## 使用方法

```JavaScript
  let a = new BankSearch(); //BankSearch类已经设置为全局变量
  a.getBankBin(6217858000110404684, (error, info) => {  //error为报错信息，info为返回值信息
    console.log(error);
    console.log(info);
  })
```

## 注意事项

当本地查询不到时，需要向后端发送请求，为避免错误，需要有 node 环境（现在使用的是 node 的 https 模块，待升级成 JavaScript 原生的请求）
