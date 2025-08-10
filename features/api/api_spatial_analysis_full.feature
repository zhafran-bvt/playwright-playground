Feature: Spatial Analysis API Full Flow
  As an API client
  I want to create and inspect a spatial analysis in one scenario
  So that I can validate the entire flow end-to-end

  Background:
    Given I have a valid API access token

  @api
  Scenario: Create spatial analysis with output grid and H3
    When I create a spatial analysis with default body
    Then I should receive a spatial analysis id
    Then the analysis status should become "SUCCESS"
    Then I fetch the analysis result datasets
    Then the intersected dataset should match the requested id
    Then i fetch the analysis summary
    Then the summary should include general statistics

  @api
  Scenario: Create spatial analysis with output grid and Geohash
    Given I set analysis output type to "TYPE_GRID"
    And I set grid type to "TYPE_GEOHASH" and level 3
    When I create a spatial analysis with default body
    Then I should receive a spatial analysis id
    Then the analysis status should become "SUCCESS"
    Then I fetch the analysis result datasets
    Then the intersected dataset should match the requested id
    Then I fetch an intersected dataset from the analysis results
    Then i fetch the analysis summary
    Then the summary should include general statistics

  @api
  Scenario: Create spatial analysis with site profiling output
    Given I set analysis output type to "TYPE_SITE_PROFILING"
    And I set scoring option to "SCALED"
    When I create a spatial analysis with default body
    Then I should receive a spatial analysis id
    Then the analysis status should become "SUCCESS"
    Then I fetch the analysis result datasets
    Then the intersected dataset should match the requested id
    Then i fetch the analysis summary
    Then the summary should include general statistics

