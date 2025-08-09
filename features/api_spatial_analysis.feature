Feature: Spatial Analysis API
  As an API client
  I want to create and inspect a spatial analysis
  So that I can retrieve results and summary

  Background:
    Given I have a valid API access token

  @api
  Scenario: Create spatial analysis
    When I create a spatial analysis with default body
    Then I should receive a spatial analysis id

  @api @timeout:300000
  Scenario: Wait for analysis to succeed
    Given a spatial analysis exists
    Then the analysis status should become "SUCCESS"

  @api @timeout:300000
  Scenario: Get result datasets
    Given a spatial analysis exists
    When I fetch the analysis result datasets
    Then the result datasets should be returned

  @api @timeout:300000
  Scenario: Get intersected dataset
    Given a spatial analysis exists
    When I fetch an intersected dataset from the analysis results
    Then the intersected dataset should match the requested id

  @api @timeout:300000
  Scenario: Get analysis summary
    Given a spatial analysis exists
    When I fetch the analysis summary
    Then the summary should include general statistics
