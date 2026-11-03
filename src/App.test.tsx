import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

beforeEach(() => localStorage.clear())

describe('App', () => {
  it('starts with $5 entry fee and $70 box price and no preset buttons', () => {
    render(<App />)
    expect(screen.getByLabelText('Entry fee ($)')).toHaveValue(5)
    expect(screen.getByLabelText('Box price ($)')).toHaveValue(70)
    expect(screen.queryByRole('button', { name: '$83' })).not.toBeInTheDocument()
  })

  it('shows the 8-player baseline figures', () => {
    render(<App />)
    expect(screen.getByTestId('revenue')).toHaveTextContent('$40.00')
    expect(screen.getByTestId('awarded-cost')).toHaveTextContent('$35.00')
    expect(screen.getByTestId('surplus')).toHaveTextContent('$5.00')
    expect(screen.getByTestId('cash-balance')).toHaveTextContent('-$30.00')
    expect(screen.getByTestId('remaining')).toHaveTextContent('12')
    expect(screen.getByTestId('awarded-total')).toHaveTextContent('12')
  })

  it('edits a placement, persists after remount, and keeps scenarios separate', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await user.click(screen.getByRole('button', { name: 'Increase 1st place packs' }))
    expect(screen.getByTestId('awarded-total')).toHaveTextContent('13')

    await user.click(screen.getByTestId('row-12'))
    expect(screen.getByTestId('awarded-total')).toHaveTextContent('18')

    unmount()
    render(<App />)
    expect(screen.getByTestId('awarded-total')).toHaveTextContent('18')
    await user.click(screen.getByTestId('row-8'))
    expect(screen.getByTestId('awarded-total')).toHaveTextContent('13')
  })

  it('warns when awarding more than inventory', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.clear(screen.getByLabelText('Packs per box'))
    await user.type(screen.getByLabelText('Packs per box'), '10')
    expect(screen.getByRole('alert')).toHaveTextContent(/only 10 are available/)
  })

  it('shows validation error and dashes for invalid price', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.clear(screen.getByLabelText('Box price ($)'))
    expect(screen.getByText('Enter the box price')).toBeInTheDocument()
    expect(screen.getByTestId('cash-balance')).toHaveTextContent('—')
  })

  it('reset defaults restores everything', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Increase 1st place packs' }))
    await user.click(screen.getByRole('button', { name: /Reset defaults/ }))
    expect(screen.getByTestId('awarded-total')).toHaveTextContent('12')
  })

  it('shows swiss rounds for the attendance', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByTestId('swiss-rounds')).toHaveTextContent('3')
    await user.click(screen.getByTestId('row-9'))
    expect(screen.getByTestId('swiss-rounds')).toHaveTextContent('4')
    await user.click(screen.getByTestId('row-17'))
    expect(screen.getByTestId('swiss-rounds')).toHaveTextContent('5')
  })

  it('highlights negative-balance rows and lists 15 scenarios', () => {
    render(<App />)
    const rows = screen.getAllByTestId(/^row-/)
    expect(rows).toHaveLength(15)
    expect(rows[0]).toHaveAttribute('data-negative', 'true')
    expect(within(screen.getByTestId('row-16')).getByText('$80.00')).toBeInTheDocument()
  })
})

describe('pack split controls', () => {
  it('sets placement total and raffle count independently', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Increase placement packs total' }))
    expect(screen.getByTestId('awarded-total')).toHaveTextContent('13')
    await user.click(screen.getByRole('button', { name: 'Increase raffle packs' }))
    expect(screen.getByTestId('awarded-total')).toHaveTextContent('14')
    await user.click(screen.getByRole('button', { name: 'Decrease placement packs total' }))
    expect(screen.getByTestId('awarded-total')).toHaveTextContent('13')
  })
})

describe('typing pack numbers', () => {
  it('lets you type the packs for a placement', async () => {
    const user = userEvent.setup()
    render(<App />)
    const first = screen.getByLabelText('1st place packs value')
    await user.clear(first)
    await user.type(first, '7')
    expect(screen.getByTestId('awarded-total')).toHaveTextContent('15')
    await user.clear(screen.getByLabelText('raffle packs value'))
    await user.type(screen.getByLabelText('raffle packs value'), '3')
    expect(screen.getByTestId('awarded-total')).toHaveTextContent('16')
  })

  it('clamps typed values to the minimum of 1 pack per place on blur', async () => {
    const user = userEvent.setup()
    render(<App />)
    const second = screen.getByLabelText('2nd place packs value')
    await user.clear(second)
    await user.type(second, '0')
    await user.tab()
    expect(second).toHaveValue(1)
  })
})

describe('add placement', () => {
  it('adds a placement with 1 pack and updates totals', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByTestId('places-info')).toHaveTextContent('Top 4')
    await user.click(screen.getByRole('button', { name: /Add placement/ }))
    expect(screen.getByTestId('places-info')).toHaveTextContent('Top 5')
    expect(screen.getByTestId('places-info')).toHaveTextContent('custom')
    expect(screen.getByLabelText('5th place packs value')).toHaveValue(1)
    expect(screen.getByTestId('awarded-total')).toHaveTextContent('13')
  })
})

describe('placement total spread', () => {
  it('adding a pack to the total goes to the lowest placement, not the top', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Increase placement packs total' }))
    expect(screen.getByLabelText('1st place packs value')).toHaveValue(4)
    expect(screen.getByLabelText('4th place packs value')).toHaveValue(2)
  })
})
