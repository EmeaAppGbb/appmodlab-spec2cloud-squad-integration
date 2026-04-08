class Property < ApplicationRecord
  has_many :leases
  has_many :maintenance_requests
  belongs_to :owner

  validates :address, :city, :state, :zip_code, :monthly_rent, presence: true
  validates :property_type, inclusion: { in: %w[apartment house condo townhouse] }

  scope :available, -> { where(is_available: true) }
  scope :in_city, ->(city) { where(city: city) }
end
