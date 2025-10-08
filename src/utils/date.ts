import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

/**
 * 格式化日期为中文格式
 * @param date 日期对象或字符串
 * @returns 格式化的日期字符串，如 "2024年1月15日"
 */
export function formatDate(date: Date | string | undefined): string {
  if (!date) return ''
  return dayjs(date).format('YYYY年MM月DD日')
}

/**
 * 格式化相对时间
 * @param date 日期对象或字符串
 * @returns 相对时间字符串，如 "3天前"
 */
export function formatRelativeTime(date: Date | string | undefined): string {
  if (!date) return ''
  return dayjs(date).fromNow()
}

/**
 * 格式化日期为ISO字符串
 * @param date 日期对象或字符串
 * @returns ISO格式的日期字符串
 */
export function formatISODate(date: Date | string | undefined): string {
  if (!date) return ''
  return dayjs(date).toISOString()
}
