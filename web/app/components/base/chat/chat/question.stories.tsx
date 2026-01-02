import type { Meta, StoryObj } from '@storybook/nextjs'

import type { ChatItem } from '../types'
import Question from './question'

const meta = {
  title: 'Base/Other/Chat Question',
  component: Question,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {},
} satisfies Meta<typeof Question>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    item: {
      id: '1',
      isAnswer: false,
      content: 'You are a helpful assistant.',
    } satisfies ChatItem,
    theme: undefined,
  },
}
