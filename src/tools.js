/*
 * @Description:
 * @Autor: shen
 * @Date: 2020-08-17 16:17:41
 * @LastEditTime: 2020-08-18 10:32:50
 */
const cardTypeMap = {
  DC: '储蓄卡',
  CC: '信用卡',
  SCC: '准贷记卡',
  PC: '预付费卡',
}
import bankcardList from './bankCardList.js'

/**
 * @description: 判断是否是函数类型
 * @param {type}
 * @return {Boolean}
 */
function isFunction(fn) {
  return Object.prototype.toString.call(fn) === '[object Function]'
}
/**
 * @description: 合并对象
 * @param {Object}
 * @return {Object}
 */
function extend(target, source) {
  let result = {}
  let key
  target = target || {}
  source = source || {}
  for (key in target) {
    if (target.hasOwnProperty(key)) {
      result[key] = target[key]
    }
  }
  for (key in source) {
    if (source.hasOwnProperty(key)) {
      result[key] = source[key]
    }
  }
  return result
}
/**
 * @description: 根据卡类型返回卡名称
 * @param {String} 卡类型
 * @return {String||undefined}
 */
function getCardTypeName(cardType) {
  if (cardTypeMap[cardType]) {
    return cardTypeMap[cardType]
  }
  return undefined
}
/**
 * @description: 根据卡号返回卡名称
 * @param {String||Number} 卡号
 * @return {String||""}
 */
function getBankNameByBankCode(bankcode) {
  for (let i = 0, len = bankcardList.length; i < len; i++) {
    let bankcard = bankcardList[i]
    if (bankcode == bankcard.bankCode) {
      return bankcard.bankName
    }
  }
  return ''
}
/**
 * @description: 根据卡号获取卡的信息
 * @param {String||Number} cardNo 卡号
 * @param {Function} cbf 回调函数
 * @return {type}
 */
function _getBankInfoByCardNo(cardNo, cbf) {
  for (let i = 0, len = bankcardList.length; i < len; i++) {
    let bankcard = bankcardList[i]
    let patterns = bankcard.patterns
    for (let j = 0, jLen = patterns.length; j < jLen; j++) {
      let pattern = patterns[j]
      if (new RegExp(pattern.reg).test(cardNo)) {
        let info = extend(bankcard, pattern)
        delete info.patterns
        delete info.reg
        info['cardTypeName'] = getCardTypeName(info['cardType'])
        return cbf(null, info)
      }
    }
  }
  return cbf(null)
}
/**
 * @description: 根据阿里接口异步获取卡的信息
 * @param {type}
 * @return {type}
 */
function _getBankInfoByCardNoAsync(cardNo, cbf) {
  let errMsg = ''
  _getBankInfoByCardNo(cardNo, function (err, info) {
    if (!err && info) {
      return cbf(null, info)
    } else {
      let https = require('https')
      https
        .get(
          'https://ccdcapi.alipay.com/validateAndCacheCardInfo.json?_input_charset=utf-8&cardNo=' +
            cardNo +
            '&cardBinCheck=true',
          function (res) {
            if (res.statusCode == 200) {
              let chunk = ''
              res.on('data', function (d) {
                chunk += d
              })
              res.on('end', function () {
                try {
                  let bankInfo = JSON.parse(chunk)
                  if (bankInfo.validated) {
                    let info = {}
                    info['bankName'] = getBankNameByBankCode(bankInfo.bank)
                    info['cardType'] = bankInfo.cardType
                    info['bankCode'] = bankInfo.bank
                    info['cardTypeName'] = getCardTypeName(bankInfo.cardType)
                    info['backName'] = info['bankName'] //向下兼容，修改字段错别字
                    cbf(null, info)
                  } else {
                    errMsg = cardNo + ':该银行卡不存在,' + chunk
                    cbf(errMsg)
                  }
                } catch (e) {
                  errMsg =
                    cardNo + ':获取alipay接口信息出错了,返回json格式不正确'
                  cbf(errMsg)
                }
              })
            } else {
              errMsg =
                cardNo +
                ':获取alipay接口信息出错了,statusCode,' +
                res.statusCode
              cbf(errMsg)
            }
          }
        )
        .on('error', function (e) {
          errMsg = cardNo + ':获取alipay接口信息出错了'
          cbf(errMsg)
        })
    }
  })
}

export function getBankBin(cardNo, cbf) {
  let errMsg = ''
  if (!isFunction(cbf)) {
    cbf = function () {}
  }
  if (isNaN(cardNo)) {
    cardNo = parseInt(cardNo)
    if (isNaN(cardNo)) {
      errMsg = cardNo + ':银行卡号必须是数字'
      return cbf(errMsg)
    }
  }
  if (cardNo.toString().length < 15 || cardNo.toString().length > 19) {
    errMsg = cardNo + ':银行卡位数必须是15到19位'
    return cbf(errMsg)
  }
  // 通过基础验证
  _getBankInfoByCardNoAsync(cardNo, function (err, bin) {
    cbf(err, bin)
  })
}
