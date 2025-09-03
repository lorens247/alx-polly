import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreatePollForm } from '../create-poll-form'

describe('CreatePollForm', () => {
  // Mock function for onSubmit prop
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    // Clear mock calls between tests
    mockOnSubmit.mockClear()
  })

  // Unit Test 1: Form renders with initial state
  it('renders form with initial two options', () => {
    render(<CreatePollForm onSubmit={mockOnSubmit} />)
    
    expect(screen.getByLabelText(/poll title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    const optionInputs = screen.getAllByPlaceholderText(/option \d/i)
    expect(optionInputs).toHaveLength(2)
  })

  // Unit Test 2: Adding and removing options
  it('allows adding and removing options', async () => {
    render(<CreatePollForm onSubmit={mockOnSubmit} />)
    
    const addButton = screen.getByRole('button', { name: /add option/i })
    fireEvent.click(addButton)
    
    let optionInputs = screen.getAllByPlaceholderText(/option \d/i)
    expect(optionInputs).toHaveLength(3)
    
    const removeButtons = screen.getAllByRole('button', { name: /×/i })
    fireEvent.click(removeButtons[0])
    
    optionInputs = screen.getAllByPlaceholderText(/option \d/i)
    expect(optionInputs).toHaveLength(2)
  })

  // Integration Test: Form submission with validation
  it('validates and submits form data correctly', async () => {
    render(<CreatePollForm onSubmit={mockOnSubmit} />)
    
    // Fill in form data
    await userEvent.type(screen.getByLabelText(/poll title/i), 'Test Poll')
    await userEvent.type(screen.getByLabelText(/description/i), 'Test Description')
    
    const optionInputs = screen.getAllByPlaceholderText(/option \d/i)
    await userEvent.type(optionInputs[0], 'Option 1')
    await userEvent.type(optionInputs[1], 'Option 2')
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /create poll/i })
    fireEvent.click(submitButton)
    
    // Verify submission
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Poll',
        description: 'Test Description',
        options: ['Option 1', 'Option 2'],
        expiresAt: undefined
      })
    })
  })

  // Additional test - Refined to check validation error
  it('shows validation error when submitting with empty options', async () => {
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {})
    render(<CreatePollForm onSubmit={mockOnSubmit} />)
    
    // Fill only title, leaving options empty
    await userEvent.type(screen.getByLabelText(/poll title/i), 'Test Poll')
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /create poll/i })
    fireEvent.click(submitButton)
    
    // Verify alert was shown and form was not submitted
    expect(mockAlert).toHaveBeenCalledWith('Please provide at least 2 options')
    expect(mockOnSubmit).not.toHaveBeenCalled()
    
    // Cleanup
    mockAlert.mockRestore()
  })
})
