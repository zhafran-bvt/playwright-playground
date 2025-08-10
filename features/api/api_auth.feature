Feature: API Authentication
  As a client
  I want to obtain an access token
  So that I can call protected endpoints

  @api
  Scenario: Get access token successfully
    Given I have a valid API access token
    Then I should have a non-empty access token

