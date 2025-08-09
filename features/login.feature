Feature: Authentication
  As a user of Lokasi Intelligence
  I want to sign in
  So that I can access the dashboard

  @web @smoke
  Scenario: User can login successfully
    Given I am on the login page
    When I sign in with valid credentials
    Then I see the dashboard

