import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from '../pages/LoginPage';
import TaskModal from '../components/TaskModal';
import ConfirmModal from '../components/ConfirmModal';

import { AuthProvider } from '../context/AuthContext';

describe('Frontend Component Tests', () => {
  it('renders login page with input fields and login button', () => {
    render(
      <AuthProvider>
        <LoginPage onSwitchToRegister={() => {}} />
      </AuthProvider>
    );
    expect(screen.getByText('SYSTEM_AUTHENTICATION')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. cyber_pilot')).toBeInTheDocument();
    expect(screen.getByText('LOGIN_SYS')).toBeInTheDocument();
  });

  it('renders task modal and validates required title input', () => {
    const handleClose = vi.fn();
    const handleSave = vi.fn();

    render(
      <TaskModal
        isOpen={true}
        onClose={handleClose}
        onSave={handleSave}
        taskToEdit={null}
      />
    );

    expect(screen.getByText('➕ CREATE_NEW_TASK')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter task title...')).toBeInTheDocument();
  });

  it('renders delete confirmation modal and triggers callbacks on click', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ConfirmModal
        isOpen={true}
        title="WARNING: DELETE TASK"
        message="Delete test task?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    expect(screen.getByText('WARNING: DELETE TASK')).toBeInTheDocument();
    expect(screen.getByText('CONFIRM DELETE [Y]')).toBeInTheDocument();

    fireEvent.click(screen.getByText('CONFIRM DELETE [Y]'));
    expect(handleConfirm).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('CANCEL [N]'));
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
