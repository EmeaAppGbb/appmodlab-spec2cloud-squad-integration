class Lease < ApplicationRecord
  belongs_to :property
  belongs_to :tenant

  validates :start_date, :end_date, :monthly_rent, presence: true
  validates :status, inclusion: { in: %w[active expired terminated] }

  scope :active, -> { where(status: 'active') }
  scope :expiring_soon, -> { where('end_date <= ?', 60.days.from_now).where(status: 'active') }

  def calculate_total_cost
    months = ((end_date - start_date) / 30).ceil
    monthly_rent * months
  end

  def is_renewable?
    end_date > 30.days.from_now && status == 'active'
  end
end
