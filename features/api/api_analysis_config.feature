Feature: Analysis Configs API
  As an API client
  I want to list analysis configs
  So that I can validate the API response

  Background:
    Given I have a valid API access token

  @api
  Scenario: List analysis configs returns data
    When I list analysis configs
    Then the response should be 200 and include data

  @api
  Scenario: Get analysis config detail
    When I fetch analysis config detail
    Then the response should be 200 and id should match

