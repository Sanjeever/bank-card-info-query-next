'use client'
import { bankDict, cardTypeDict } from '@/dict'
import type { CardInfoResp } from '@/pages/api/alipay/card-info'
import axios from 'axios'
import qs from 'qs'
import { useMemo, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { CSSTransition } from 'react-transition-group'

export default function Home() {
  const [form, setForm] = useState({
    cardNo: '',
  })
  const [data, setData] = useState({
    cardType: '',
    bank: '',
    key: '',
  })
  const hasData = useMemo(() => {
    return data.cardType !== '' && data.bank !== '' && data.key !== ''
  }, [data])
  const src = useMemo(() => {
    const query = {
      d: 'cashier',
      t: data.bank,
    }
    return `https://apimg.alipay.com/combo.png?${qs.stringify(query)}`
  }, [data.bank])

  async function fetchData() {
    const response = await axios.get(`/api/alipay/card-info`, {
      params: {
        cardNo: form.cardNo,
      },
    })
    const { cardType, bank, key, messages } = response.data as CardInfoResp
    if (messages.length === 0) {
      setData({ cardType, bank, key })
    } else {
      const errorMsg = messages.map(message => message.errorCodes).join(',')
      toast.error(errorMsg)
    }
  }

  function handleChange(event: React.FormEvent<HTMLInputElement>) {
    setForm({ ...form, cardNo: event.currentTarget.value })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setData({
      cardType: '',
      bank: '',
      key: '',
    })
    if (form.cardNo.trim().length === 0) {
      toast.error('请输入银行卡号')
      return
    }
    await fetchData()
  }

  return (
    <main className='h-full flex flex-col gap-4 justify-center items-center'>
      <Toaster />
      <form className='flex gap-4' onSubmit={handleSubmit}>
        <input
          onChange={handleChange}
          type='text'
          placeholder='请输入银行卡号'
          className='input input-bordered w-full max-w-xs'
        />
        <button className='btn' type='submit'>查询</button>
      </form>

      <CSSTransition in={hasData} timeout={300} classNames='fade' unmountOnExit>
        {hasData ? (
          <div className='card bg-base-100 w-96 shadow-xl'>
            <div className='card-body'>
              <h2 className='card-title'>查询结果</h2>
              <p>
                <strong>卡类型</strong> {cardTypeDict[data.cardType]}{' '}
                {data.cardType}
              </p>
              <p>
                <strong>发卡行</strong> {bankDict[data.bank]} {data.bank}
              </p>
              <p>
                <strong>行图标</strong>{' '}
                <img
                  src={src}
                  style={{
                    display: 'inline-block',
                    overflow: 'hidden',
                    width: '128px',
                    height: '36px',
                  }}
                  alt='行图标'
                />
              </p>
            </div>
          </div>
        ) : (
          <></>
        )}
      </CSSTransition>
    </main>
  )
}
