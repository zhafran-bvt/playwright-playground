Feature: Logout
  As an authenticated user
  I want to log out
  So that I securely end my session

  Background:
    Given I am logged in

  @web @smoke
  Scenario: User can logout successfully
    When I open the user menu
    And I choose to log out
    And I confirm log out
    Then I see the Welcome Back screen

