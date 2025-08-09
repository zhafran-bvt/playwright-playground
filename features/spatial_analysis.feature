Feature: Spatial Analysis
  As an authenticated user
  I want to generate spatial analysis results
  So that I can visualize scores on an H3 grid

  Background:
    Given I am logged in

  @web
  Scenario: Run spatial analysis with one dataset and H3 output
    When I open the Dataset Explorer
    And I add dataset "Thematic Village SES 2022"
    And I open Spatial Settings
    And I choose Administrative Area
    And I set Administrative Area Country "Indonesia" Province "Dki Jakarta" City "Jakarta Timur" District "Duren Sawit"
    And I select H3 resolution "1.40Km 5.16Km2"
    And I generate analysis results
    Then I see the dashboard marker and Spatial Analysis title

