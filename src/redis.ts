/**
 * src/redis.ts
 * Establishes the connection to a Redis database
 */

import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: 'https://usw1-absolute-orca-33868.upstash.io',
  token: 'AYRMASQgZDg1OTk5ZTgtMjJjZi00MDhhLTgwZGYtNDVlMDMxNzE0NzRmODUyMWQwMGVkNzBhNDM1OWFhYTg2MDQxYTExYTUzN2I=',
})
