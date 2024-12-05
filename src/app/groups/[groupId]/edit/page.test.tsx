import React from 'react'
import { render, screen } from '@testing-library/react'
import EditGroupPage, { metadata } from './page'
import { EditGroup } from '@/app/groups/[groupId]/edit/edit-group'

// Mock the `EditGroup` component
jest.mock('@/app/groups/[groupId]/edit/edit-group', () => ({
  EditGroup: jest.fn(() => <div data-testid="edit-group-component">EditGroup Component</div>),
}))

describe('EditGroupPage Component', () => {
  it('renders the EditGroup component', async () => {
    render(await EditGroupPage())

    expect(screen.getByTestId('edit-group-component')).toBeInTheDocument()
  })

  it('has the correct metadata', () => {
    expect(metadata.title).toBe('Settings')
  })
})
