import {
  BarChart3,
  Check,
  Pencil,
  Plus,
  Target,
  Trash2,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { EmptyState, Modal } from '../components/Modal'
import { useApp } from '../store/AppContext'
import type { Author, Expense, ExpenseCategory, ExpenseSplit, FoodLog, JointGoal } from '../types'
import { emojiOptions, formatUsd } from '../utils/helpers'
import {
  computeSettlement,
  countCityVisits,
  countMlbGames,
  monthlySummary,
  topFoodMenus,
} from '../utils/stats'

type Section = 'goals' | 'expenses' | 'stats'

const expenseCategories: { id: ExpenseCategory; label: string }[] = [
  { id: 'date', label: '데이트' },
  { id: 'travel', label: '여행' },
  { id: 'food', label: '식사' },
  { id: 'other', label: '기타' },
]

const emptyGoal = (): Omit<JointGoal, 'id'> => ({
  title: '',
  currentAmount: 0,
  targetAmount: 100,
  unit: '$',
  emoji: '🎯',
  deadline: '',
})

const emptyExpense = () => ({
  title: '',
  amount: 0,
  paidBy: 'me' as Author,
  split: 'equal' as ExpenseSplit,
  category: 'date' as ExpenseCategory,
  date: new Date().toISOString().slice(0, 10),
  note: '',
})

export function TogetherPage() {
  const {
    data,
    addGoal,
    updateGoal,
    removeGoal,
    addExpense,
    updateExpense,
    toggleExpenseSettled,
    removeExpense,
    addFoodLog,
    updateFoodLog,
    removeFoodLog,
  } = useApp()
  const { settings, goals, expenses, foodLogs } = data
  const [section, setSection] = useState<Section>('goals')

  const settlement = useMemo(() => computeSettlement(data), [data])
  const mlbCount = useMemo(() => countMlbGames(data), [data])
  const cityStats = useMemo(() => countCityVisits(data, settings), [data, settings])
  const foods = useMemo(() => topFoodMenus(data), [data])
  const monthStats = useMemo(() => monthlySummary(data, new Date()), [data])

  const [goalOpen, setGoalOpen] = useState(false)
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
  const [goalDraft, setGoalDraft] = useState(emptyGoal())

  const [expenseOpen, setExpenseOpen] = useState(false)
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)
  const [expenseDraft, setExpenseDraft] = useState(emptyExpense())

  const [foodOpen, setFoodOpen] = useState(false)
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null)
  const [foodDraft, setFoodDraft] = useState({ menu: '', date: new Date().toISOString().slice(0, 10) })

  const isMoneyGoal = goalDraft.unit !== '달성'

  function openAddGoal() {
    setEditingGoalId(null)
    setGoalDraft(emptyGoal())
    setGoalOpen(true)
  }

  function openEditGoal(goal: JointGoal) {
    setEditingGoalId(goal.id)
    setGoalDraft({
      title: goal.title,
      currentAmount: goal.currentAmount,
      targetAmount: goal.targetAmount,
      unit: goal.unit,
      emoji: goal.emoji,
      deadline: goal.deadline,
    })
    setGoalOpen(true)
  }

  function closeGoalModal() {
    setGoalOpen(false)
    setEditingGoalId(null)
    setGoalDraft(emptyGoal())
  }

  function handleSaveGoal() {
    if (!goalDraft.title.trim() || goalDraft.targetAmount <= 0) return
    const payload = {
      ...goalDraft,
      title: goalDraft.title.trim(),
      unit: goalDraft.unit === '달성' ? '달성' : '$',
    }
    if (editingGoalId) {
      updateGoal(editingGoalId, payload)
    } else {
      addGoal(payload)
    }
    closeGoalModal()
  }

  function openAddExpense() {
    setEditingExpenseId(null)
    setExpenseDraft(emptyExpense())
    setExpenseOpen(true)
  }

  function openEditExpense(expense: Expense) {
    setEditingExpenseId(expense.id)
    setExpenseDraft({
      title: expense.title,
      amount: expense.amount,
      paidBy: expense.paidBy,
      split: expense.split,
      category: expense.category,
      date: expense.date,
      note: expense.note,
    })
    setExpenseOpen(true)
  }

  function closeExpenseModal() {
    setExpenseOpen(false)
    setEditingExpenseId(null)
    setExpenseDraft(emptyExpense())
  }

  function handleSaveExpense() {
    if (!expenseDraft.title.trim() || expenseDraft.amount <= 0) return
    const payload = {
      ...expenseDraft,
      title: expenseDraft.title.trim(),
      currency: 'USD' as const,
    }
    if (editingExpenseId) {
      updateExpense(editingExpenseId, payload)
    } else {
      addExpense({ ...payload, settled: false })
    }
    closeExpenseModal()
  }

  function openAddFood() {
    setEditingFoodId(null)
    setFoodDraft({ menu: '', date: new Date().toISOString().slice(0, 10) })
    setFoodOpen(true)
  }

  function openEditFood(log: FoodLog) {
    setEditingFoodId(log.id)
    setFoodDraft({ menu: log.menu, date: log.date })
    setFoodOpen(true)
  }

  function closeFoodModal() {
    setFoodOpen(false)
    setEditingFoodId(null)
    setFoodDraft({ menu: '', date: new Date().toISOString().slice(0, 10) })
  }

  function handleSaveFood() {
    if (!foodDraft.menu.trim()) return
    if (editingFoodId) {
      updateFoodLog(editingFoodId, { menu: foodDraft.menu.trim(), date: foodDraft.date })
    } else {
      addFoodLog(foodDraft.menu, foodDraft.date)
    }
    closeFoodModal()
  }

  return (
    <div className="fade-in space-y-4">
      <div>
        <h1 className="page-title">함께</h1>
        <p className="text-sm text-zinc-500">목표 · 지출 · 우리 통계</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(
          [
            { id: 'goals' as const, label: '목표', icon: Target },
            { id: 'expenses' as const, label: '지출', icon: Wallet },
            { id: 'stats' as const, label: '통계', icon: BarChart3 },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSection(id)}
            className={`flex flex-col items-center gap-1 rounded-xl py-2.5 text-xs font-semibold transition ${
              section === id
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-white text-zinc-500 ring-1 ring-rose-100'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {section === 'goals' && (
        <>
          <div className="flex justify-end">
            <button className="btn-primary" onClick={openAddGoal}>
              <Plus size={16} />
              목표 추가
            </button>
          </div>
          {goals.length === 0 ? (
            <EmptyState
              emoji="🎯"
              title="공동 목표가 없어요"
              description="결혼 자금, 첫 수익 같은 목표를 세워봐"
            />
          ) : (
            <div className="space-y-3">
              {goals.map((goal) => {
                const pct = Math.min(
                  100,
                  Math.round((goal.currentAmount / goal.targetAmount) * 100) || 0,
                )
                return (
                  <section key={goal.id} className="card p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{goal.emoji}</span>
                        <div>
                          <div className="font-semibold text-zinc-800">{goal.title}</div>
                          {goal.deadline && (
                            <div className="text-xs text-zinc-400">마감 {goal.deadline}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          onClick={() => openEditGoal(goal)}
                          title="수정"
                          className="rounded-lg p-1.5 text-zinc-300 hover:text-rose-400"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => removeGoal(goal.id)}
                          title="삭제"
                          className="rounded-lg p-1.5 text-zinc-300 hover:text-rose-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="mb-1 flex justify-between text-xs text-zinc-500">
                      <span>{formatGoalAmounts(goal)}</span>
                      <span className="font-semibold text-rose-500">{pct}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-rose-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {goal.unit !== '달성' && (
                      <button
                        className="btn-secondary mt-3 w-full py-2 text-xs"
                        onClick={() =>
                          updateGoal(goal.id, {
                            currentAmount: Math.min(
                              goal.targetAmount,
                              Math.round((goal.currentAmount + goal.targetAmount * 0.05) * 100) /
                                100,
                            ),
                          })
                        }
                      >
                        현재 금액 +5%
                      </button>
                    )}
                  </section>
                )
              })}
            </div>
          )}
        </>
      )}

      {section === 'expenses' && (
        <>
          <section className="card bg-gradient-to-br from-rose-50 to-white p-4">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-zinc-700">
              <TrendingUp size={16} className="text-rose-400" />
              정산 요약
            </div>
            <p className="text-sm text-zinc-600">{settlement.message}</p>
            {settlement.owes && (
              <div className="mt-2 text-lg font-bold text-rose-600">
                {formatUsd(settlement.owes.amount)}
              </div>
            )}
          </section>

          <div className="flex justify-end">
            <button className="btn-primary" onClick={openAddExpense}>
              <Plus size={16} />
              지출 추가
            </button>
          </div>

          {expenses.length === 0 ? (
            <EmptyState
              emoji="💸"
              title="지출 기록이 없어요"
              description="데이트·여행 비용을 기록하고 정산해요"
            />
          ) : (
            <div className="space-y-2">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className={`card flex items-center gap-3 p-3 ${expense.settled ? 'opacity-60' : ''}`}
                >
                  <button
                    onClick={() => toggleExpenseSettled(expense.id)}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                      expense.settled
                        ? 'border-emerald-400 bg-emerald-400 text-white'
                        : 'border-rose-200 bg-white'
                    }`}
                  >
                    {expense.settled && <Check size={14} />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${expense.settled ? 'line-through text-zinc-400' : 'text-zinc-800'}`}
                      >
                        {expense.title}
                      </span>
                      <span className="rounded-lg bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500">
                        {expenseCategories.find((c) => c.id === expense.category)?.label}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500">
                      {expense.date} ·{' '}
                      {expense.paidBy === 'me' ? settings.myName : settings.partnerName} 결제 ·{' '}
                      {expense.split === 'equal' ? '반반' : expense.split === 'me' ? '내 몫' : '상대 몫'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-zinc-800">{formatUsd(expense.amount)}</div>
                  </div>
                  <button
                    onClick={() => openEditExpense(expense)}
                    title="수정"
                    className="rounded-lg p-1.5 text-zinc-300 hover:text-rose-400"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => removeExpense(expense.id)}
                    title="삭제"
                    className="rounded-lg p-1.5 text-zinc-300 hover:text-rose-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {section === 'stats' && (
        <>
          <section className="card overflow-hidden bg-gradient-to-br from-rose-400 to-rose-500 p-5 text-white">
            <div className="text-sm text-rose-100">{monthStats.label} 정산</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <StatBox label="여행 기록" value={`${monthStats.trips}곳`} />
              <StatBox label="추억" value={`${monthStats.memories}개`} />
              <StatBox label="이번 달 지출" value={formatUsd(monthStats.spentUsd)} />
              <StatBox label="식사 기록" value={`${monthStats.foodCount}번`} />
            </div>
          </section>

          <section className="card p-4">
            <h2 className="mb-3 text-sm font-semibold text-zinc-700">올해 우리 기록</h2>
            <div className="space-y-3">
              <StatRow emoji="⚾" label="함께 본 MLB 야구경기" value={`${mlbCount}경기`} />
              <StatRow
                emoji="🗺️"
                label="함께 간 도시"
                value={`${cityStats.uniqueCities}곳 (${cityStats.totalTrips}번 방문)`}
              />
              <StatRow
                emoji="🏠"
                label={`${settings.partnerCity} 방문`}
                value={`${cityStats.partnerCityVisits}번`}
              />
              <StatRow
                emoji="✈️"
                label={`${settings.myCity} 방문`}
                value={`${cityStats.myCityVisits}번`}
              />
            </div>
          </section>

          <section className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                <UtensilsCrossed size={16} className="text-rose-400" />
                가장 많이 먹은 메뉴
              </div>
              <button className="text-xs font-medium text-rose-500" onClick={openAddFood}>
                + 추가
              </button>
            </div>
            {foods.length === 0 ? (
              <p className="text-center text-sm text-zinc-400">음식 기록이 없어요</p>
            ) : (
              <div className="space-y-2">
                {foods.map(({ menu, count }, i) => (
                  <div key={menu} className="flex items-center gap-3">
                    <span className="w-5 text-center text-xs font-bold text-rose-400">{i + 1}</span>
                    <div className="flex-1 truncate text-sm text-zinc-700">{menu}</div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-rose-100">
                        <div
                          className="h-full rounded-full bg-rose-400"
                          style={{ width: `${(count / foods[0].count) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-zinc-500">{count}회</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {foodLogs.length > 0 && (
              <div className="mt-3 space-y-1 border-t border-rose-50 pt-3">
                {foodLogs.slice(0, 8).map((log) => (
                  <div key={log.id} className="flex items-center justify-between gap-2 text-xs text-zinc-500">
                    <span className="min-w-0 truncate">
                      {log.menu} · {log.date}
                    </span>
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => openEditFood(log)}
                        title="수정"
                        className="text-zinc-300 hover:text-rose-400"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => removeFoodLog(log.id)}
                        title="삭제"
                        className="text-zinc-300 hover:text-rose-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <Modal
        open={goalOpen}
        onClose={closeGoalModal}
        title={editingGoalId ? '목표 수정' : '공동 목표 추가'}
      >
        <div className="space-y-3">
          <input
            className="input"
            placeholder="목표 (예: 결혼 자금 모으기)"
            value={goalDraft.title}
            onChange={(e) => setGoalDraft({ ...goalDraft, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setGoalDraft({ ...goalDraft, unit: '$' })}
              className={`rounded-xl py-2 text-xs font-semibold ${
                isMoneyGoal ? 'bg-rose-50 text-rose-600 ring-2 ring-rose-200' : 'bg-zinc-50 text-zinc-500'
              }`}
            >
              💵 금액 ($)
            </button>
            <button
              type="button"
              onClick={() => setGoalDraft({ ...goalDraft, unit: '달성' })}
              className={`rounded-xl py-2 text-xs font-semibold ${
                !isMoneyGoal ? 'bg-rose-50 text-rose-600 ring-2 ring-rose-200' : 'bg-zinc-50 text-zinc-500'
              }`}
            >
              ✅ 달성 횟수
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label={isMoneyGoal ? '현재 ($)' : '현재'}>
              <input
                type="number"
                step={isMoneyGoal ? '0.01' : '1'}
                className="input"
                value={goalDraft.currentAmount}
                onChange={(e) =>
                  setGoalDraft({ ...goalDraft, currentAmount: Number(e.target.value) || 0 })
                }
              />
            </Field>
            <Field label={isMoneyGoal ? '목표 ($)' : '목표'}>
              <input
                type="number"
                step={isMoneyGoal ? '0.01' : '1'}
                className="input"
                value={goalDraft.targetAmount}
                onChange={(e) =>
                  setGoalDraft({ ...goalDraft, targetAmount: Number(e.target.value) || 0 })
                }
              />
            </Field>
          </div>
          <Field label="마감일 (선택)">
            <input
              type="date"
              className="input"
              value={goalDraft.deadline}
              onChange={(e) => setGoalDraft({ ...goalDraft, deadline: e.target.value })}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            {emojiOptions.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setGoalDraft({ ...goalDraft, emoji: e })}
                className={`rounded-xl px-2 py-1 text-lg ${
                  goalDraft.emoji === e ? 'bg-rose-100 ring-2 ring-rose-300' : 'bg-rose-50'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
          <button className="btn-primary w-full" onClick={handleSaveGoal}>
            {editingGoalId ? '수정 저장' : '추가하기'}
          </button>
        </div>
      </Modal>

      <Modal
        open={expenseOpen}
        onClose={closeExpenseModal}
        title={editingExpenseId ? '지출 수정' : '지출 추가'}
      >
        <div className="space-y-3">
          <input
            className="input"
            placeholder="내용 (예: 저녁 식사)"
            value={expenseDraft.title}
            onChange={(e) => setExpenseDraft({ ...expenseDraft, title: e.target.value })}
          />
          <Field label="금액 ($)">
            <input
              type="number"
              step="0.01"
              className="input"
              value={expenseDraft.amount}
              onChange={(e) =>
                setExpenseDraft({ ...expenseDraft, amount: Number(e.target.value) || 0 })
              }
            />
          </Field>
          <Field label="날짜">
            <input
              type="date"
              className="input"
              value={expenseDraft.date}
              onChange={(e) => setExpenseDraft({ ...expenseDraft, date: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="결제">
              <select
                className="input"
                value={expenseDraft.paidBy}
                onChange={(e) =>
                  setExpenseDraft({ ...expenseDraft, paidBy: e.target.value as Author })
                }
              >
                <option value="me">{settings.myName}</option>
                <option value="partner">{settings.partnerName}</option>
              </select>
            </Field>
            <Field label="분할">
              <select
                className="input"
                value={expenseDraft.split}
                onChange={(e) =>
                  setExpenseDraft({ ...expenseDraft, split: e.target.value as ExpenseSplit })
                }
              >
                <option value="equal">반반</option>
                <option value="me">{settings.myName} 전액</option>
                <option value="partner">{settings.partnerName} 전액</option>
              </select>
            </Field>
          </div>
          <div className="flex flex-wrap gap-2">
            {expenseCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setExpenseDraft({ ...expenseDraft, category: c.id })}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                  expenseDraft.category === c.id
                    ? 'bg-rose-50 text-rose-600 ring-2 ring-rose-200'
                    : 'bg-zinc-50 text-zinc-500'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <textarea
            className="input"
            rows={2}
            placeholder="메모 (선택)"
            value={expenseDraft.note}
            onChange={(e) => setExpenseDraft({ ...expenseDraft, note: e.target.value })}
          />
          <button className="btn-primary w-full" onClick={handleSaveExpense}>
            {editingExpenseId ? '수정 저장' : '추가하기'}
          </button>
        </div>
      </Modal>

      <Modal
        open={foodOpen}
        onClose={closeFoodModal}
        title={editingFoodId ? '음식 기록 수정' : '음식 기록 추가'}
      >
        <div className="space-y-3">
          <input
            className="input"
            placeholder="메뉴 (예: 멕시칸 볼, 한식)"
            value={foodDraft.menu}
            onChange={(e) => setFoodDraft({ ...foodDraft, menu: e.target.value })}
          />
          <Field label="날짜">
            <input
              type="date"
              className="input"
              value={foodDraft.date}
              onChange={(e) => setFoodDraft({ ...foodDraft, date: e.target.value })}
            />
          </Field>
          <button className="btn-primary w-full" onClick={handleSaveFood}>
            {editingFoodId ? '수정 저장' : '추가하기'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

function formatGoalAmounts(goal: JointGoal) {
  if (goal.unit === '달성') {
    return `${goal.currentAmount} / ${goal.targetAmount} ${goal.unit}`
  }
  return `${formatUsd(goal.currentAmount)} / ${formatUsd(goal.targetAmount)}`
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-500">{label}</span>
      {children}
    </label>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/15 px-3 py-2">
      <div className="text-[10px] text-rose-100">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  )
}

function StatRow({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-rose-50/50 px-3 py-2.5">
      <span className="text-xl">{emoji}</span>
      <div className="flex-1 text-sm text-zinc-600">{label}</div>
      <div className="text-sm font-bold text-zinc-800">{value}</div>
    </div>
  )
}
