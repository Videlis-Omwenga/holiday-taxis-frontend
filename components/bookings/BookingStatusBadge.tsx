'use client'

import { BookingStatus } from '@/types'
import { CheckCircle, Clock, Navigation, User, MapPin, XCircle, AlertCircle } from 'lucide-react'

interface BookingStatusBadgeProps {
  status: BookingStatus
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function BookingStatusBadge({
  status,
  showIcon = true,
  size = 'md'
}: BookingStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case BookingStatus.pending:
        return {
          label: 'Pending Allocation',
          icon: Clock,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-300',
          iconColor: 'text-gray-500',
        }
      case BookingStatus.allocated:
        return {
          label: 'Allocated',
          icon: CheckCircle,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-300',
          iconColor: 'text-blue-600',
        }
      case BookingStatus.driver_en_route:
        return {
          label: 'Driver En Route',
          icon: Navigation,
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-300',
          iconColor: 'text-purple-600',
        }
      case BookingStatus.passenger_on_board:
        return {
          label: 'Passenger On Board',
          icon: User,
          bgColor: 'bg-indigo-100',
          textColor: 'text-indigo-700',
          borderColor: 'border-indigo-300',
          iconColor: 'text-indigo-600',
        }
      case BookingStatus.completed:
        return {
          label: 'Completed',
          icon: MapPin,
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-300',
          iconColor: 'text-green-600',
        }
      case BookingStatus.cancelled:
        return {
          label: 'Cancelled',
          icon: XCircle,
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          borderColor: 'border-red-300',
          iconColor: 'text-red-600',
        }
      case BookingStatus.no_show:
        return {
          label: 'No Show',
          icon: AlertCircle,
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-300',
          iconColor: 'text-orange-600',
        }
      default:
        return {
          label: status,
          icon: Clock,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-300',
          iconColor: 'text-gray-500',
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} ${config.bgColor} ${config.textColor} border ${config.borderColor} rounded-full font-medium`}
    >
      {showIcon && <Icon className={`${iconSizes[size]} ${config.iconColor}`} />}
      {config.label}
    </span>
  )
}

// Status timeline component for detailed view
export function BookingStatusTimeline({ currentStatus }: { currentStatus: BookingStatus }) {
  const steps = [
    { status: BookingStatus.pending, label: 'Pending' },
    { status: BookingStatus.allocated, label: 'Allocated' },
    { status: BookingStatus.driver_en_route, label: 'En Route' },
    { status: BookingStatus.passenger_on_board, label: 'On Board' },
    { status: BookingStatus.completed, label: 'Completed' },
  ]

  const currentIndex = steps.findIndex(step => step.status === currentStatus)

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const isActive = index === currentIndex
        const isCompleted = index < currentIndex
        const isFuture = index > currentIndex

        return (
          <div key={step.status} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                isActive
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : isCompleted
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <span className="text-xs font-medium">{index + 1}</span>
              )}
            </div>
            <div className="ml-2 min-w-0">
              <p
                className={`text-xs font-medium ${
                  isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {step.label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-3 w-12 h-0.5 ${
                  isCompleted ? 'bg-green-600' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
