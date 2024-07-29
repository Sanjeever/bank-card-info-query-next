import Axios from 'axios'
import { setupCache } from 'axios-cache-interceptor'
import type { NextApiRequest, NextApiResponse } from 'next'

export interface CardInfoResp {
  /**
   * 卡类型（DC 借记卡, CC 贷记卡）
   */
  cardType: string

  /**
   * 行代码
   */
  bank: string

  /**
   * 卡号
   */
  key: string

  /**
   * 错误信息
   */
  messages: {
    errorCodes: string
    name: string
  }[]

  /**
   * 是否验证通过
   */
  validated: boolean
  stat: string
}

const request = setupCache(
  Axios.create({
    baseURL: 'https://ccdcapi.alipay.com',
  })
)
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CardInfoResp>
) {
  const { cardNo } = req.query
  const response = await request.get('/validateAndCacheCardInfo.json', {
    params: {
      _input_charset: 'utf-8',
      cardBinCheck: true,
      cardNo,
    },
  })
  res.setHeader('Content-Type', 'application/json')
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=1800, stale-while-revalidate=2400'
  )
  res.status(200).json(response.data as CardInfoResp)
}
