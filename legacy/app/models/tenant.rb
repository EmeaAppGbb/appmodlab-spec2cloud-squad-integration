class Tenant < ApplicationRecord
  has_many :leases
  has_many :tenant_applications
  has_many :maintenance_requests

  validates :first_name, :last_name, :email, :phone, presence: true
  validates :email, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }

  def full_name
    "#{first_name} #{last_name}"
  end

  def active_leases
    leases.where(status: 'active')
  end
end
