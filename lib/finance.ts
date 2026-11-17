export type CurrencyCode = 'NGN' | 'USD'
export type DurationUnit = 'days' | 'weeks' | 'months'

export type OfferAnalysisInput = {
  offer: number
  duration: number
  durationUnit: DurationUnit
  hoursPerDay: number
  daysPerWeek: number
  monthlyExpenses: number
  monthlyIncomeTarget: number
  savings: number
}

export const MONTH_WEEKS = 4.345
export const MONTH_DAYS = 30.4375

export function currencySymbol(currency: string) {
  if (currency === 'NGN') return '₦'
  if (currency === 'USD') return '$'
  return `${currency} `
}

export function formatCurrency(value: number, currency: string) {
  const amount = Number.isFinite(value) ? value : 0
  return `${currencySymbol(currency)}${Math.abs(amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

export function monthlyBurn(monthlyExpenses: number, monthlyIncome: number) {
  const expenses = Math.max(0, Number.isFinite(monthlyExpenses) ? monthlyExpenses : 0)
  const income = Math.max(0, Number.isFinite(monthlyIncome) ? monthlyIncome : 0)
  return Math.max(0, expenses - income)
}

export function runwayMonths(savings: number, monthlyExpenses: number, monthlyIncome: number) {
  const burn = monthlyBurn(monthlyExpenses, monthlyIncome)
  const balance = Math.max(0, Number.isFinite(savings) ? savings : 0)
  return burn > 0 ? balance / burn : null
}

export function hourlyRates(monthlyExpenses: number, monthlyIncomeTarget: number, monthlyBillableHours: number) {
  if (!Number.isFinite(monthlyBillableHours) || monthlyBillableHours <= 0 || monthlyBillableHours > 744
    || !Number.isFinite(monthlyIncomeTarget) || monthlyIncomeTarget < 0) {
    return { minimum: null, suggested: null }
  }

  const expenses = Math.max(0, Number.isFinite(monthlyExpenses) ? monthlyExpenses : 0)
  const incomeTarget = Math.max(0, monthlyIncomeTarget)

  return {
    minimum: expenses / monthlyBillableHours,
    suggested: Math.max(expenses, incomeTarget) / monthlyBillableHours,
  }
}

export function analyzeOffer(input: OfferAnalysisInput) {
  const { offer, duration, durationUnit, hoursPerDay, daysPerWeek } = input
  const validInputs = [offer, duration, hoursPerDay, daysPerWeek].every(Number.isFinite)
    && offer >= 0
    && duration > 0
    && duration <= 120
    && hoursPerDay > 0
    && hoursPerDay <= 24
    && Number.isInteger(daysPerWeek)
    && daysPerWeek > 0
    && daysPerWeek <= 7

  const months = durationUnit === 'days'
    ? duration / MONTH_DAYS
    : durationUnit === 'weeks'
      ? duration / MONTH_WEEKS
      : duration
  const weeks = months * MONTH_WEEKS
  const totalHours = weeks * daysPerWeek * hoursPerDay
  const monthlyExpenses = Math.max(0, Number.isFinite(input.monthlyExpenses) ? input.monthlyExpenses : 0)
  const monthlyIncomeTarget = Math.max(0, Number.isFinite(input.monthlyIncomeTarget) ? input.monthlyIncomeTarget : 0)
  const savings = Math.max(0, Number.isFinite(input.savings) ? input.savings : 0)
  const projectExpenses = monthlyExpenses * months
  const minimumOffer = projectExpenses
  const targetOffer = monthlyIncomeTarget * months
  const netProjectContribution = offer - projectExpenses
  const burn = monthlyBurn(monthlyExpenses, monthlyIncomeTarget)
  const currentRunway = runwayMonths(savings, monthlyExpenses, monthlyIncomeTarget)
  const runwayAfterOffer = runwayMonths(savings + netProjectContribution, monthlyExpenses, monthlyIncomeTarget)
  const targetDifference = offer - targetOffer
  const minimumDifference = offer - minimumOffer
  const targetCoverage = targetOffer > 0 ? (offer / targetOffer) * 100 : 0
  const status = !validInputs || !Number.isFinite(totalHours) || totalHours <= 0
    ? 'incomplete'
    : offer < minimumOffer
      ? 'below-expenses'
      : offer < targetOffer
        ? 'below-target'
        : Math.abs(offer - targetOffer) < 0.005
          ? 'meets-target'
          : 'exceeds-target'

  return {
    offer: Math.max(0, Number.isFinite(offer) ? offer : 0),
    months,
    weeks,
    totalHours,
    projectExpenses,
    hourlyRate: totalHours > 0 ? Math.max(0, offer) / totalHours : 0,
    breakEvenRate: totalHours > 0 ? projectExpenses / totalHours : 0,
    targetRate: totalHours > 0 ? targetOffer / totalHours : 0,
    minimumOffer,
    targetOffer,
    targetDifference,
    minimumDifference,
    targetCoverage,
    netProjectContribution,
    monthlyEquivalent: months > 0 ? Math.max(0, offer) / months : 0,
    currentRunway,
    runwayAfterOffer,
    monthlyBurn: burn,
    complete: status !== 'incomplete',
    status,
  }
}
