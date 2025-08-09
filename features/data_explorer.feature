Feature: Data Explorer
  As an authenticated user
  I want to browse and add datasets
  So that I can explore data on the map

  Background:
    Given I am logged in

  @web @smoke
  Scenario: User can open the Dataset Explorer
    When I open the Dataset Explorer
    Then I see the Dataset Explorer modal
    And I see the Data Explorer page title

  @web
  Scenario: User can add BVT dataset from Data Explorer
    When I open the Dataset Explorer
    And I add dataset "Thematic Village SES 2022"
    Then I see dataset notification "Thematic Village SES 2022"

  @web
  Scenario: User can add User dataset from My Organization
    When I open the Dataset Explorer
    And I switch to catalog "My Organization"
    And I add dataset "VISA Average Transaction"
    Then I see dataset notification "VISA Average Transaction"
