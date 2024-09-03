/// <reference types="cypress" />

describe('API interception', () => {


    it('Intercercept Save/Update API', () => {

        cy.intercept('POST', 'https://qa-workplace.altairglobal.net/ee/budget/saveUpdates/2019-52195').as('saveUpdates') // Intercept POST request after save a budget change

        cy.visit('https://qa-workplace.altairglobal.net/ee/dashboard/employee/2019-52195#?tab=budgetTool') // DASH URL 
        cy.get('#UserName').type('abrahamrodriguez') // User field
        cy.get('.btn').click() // Login button

        cy.get('li[active="tabs.BudgetTool.active"]').click() // Budget tool tab

        cy.get(':nth-child(11) > .btn > :nth-child(1) > .col-md-11').click() // Category Selector

        cy.get('.form-inline > :nth-child(2) > .btn-primary').click() // Save button


        // Here is where API is saving and updating budget information //
        cy.wait('@saveUpdates').then((update => {
            cy.log(update)

            expect(update.request.method).to.eq('POST') // Request Validation

            expect(update.response.statusCode).to.eq(200) // Status Validation
            expect(update.response.statusMessage).to.eq('OK') // Validating if request is available up and running
            expect(update.response.body).to.have.property('budget') // Info validation
            expect(update.response.body).to.have.property('categories') // Info Validation
            expect(update.response.headers).to.have.property('content-type').to.eq('application/json; charset=utf-8') // Response type validation

        }))
        // End of test //

    })

    it('Intercept API set hasSavedBudget flag true ', () => {

        cy.intercept('GET', 'https://qa-workplace.altairglobal.net/ee/budget/get/**').as('hasSavedBudget') // Intercept GET request after save budget 


        cy.visit('https://qa-workplace.altairglobal.net/ee/dashboard/employee/2019-52195#?tab=budgetTool') // DASH URL 
        cy.get('#UserName').type('abrahamrodriguez') // User field
        cy.get('.btn').click() // Login button

        cy.get('li[active="tabs.BudgetTool.active"]').click() // Budget tool tab

        // After Save budget information the flag should be TRUE //
        cy.wait('@hasSavedBudget').then((budgetFlag) => {
            cy.log(budgetFlag)
            expect(budgetFlag.response.body.budgetData.summary).to.have.property('hasSavedBudget').to.eq(true) //< ------ THIS LINE SHOULD VALIDATE IF FLAG IS TRUE AFTER A BUDGET RESET

        })
        // End of test //

    })

    it('Intercet API ResetButton set hasSavedBudget flag to false', () => {

        cy.intercept('POST', 'https://qa-workplace.altairglobal.net/ee/budget/ResetBudgetPlan/').as('refreshBudgetPlan') // Intercet POST request when budget is reset

        cy.visit('https://qa-workplace.altairglobal.net/ee/dashboard/employee/2019-52195#?tab=budgetTool') // DASH URL 
        cy.get('#UserName').type('abrahamrodriguez') // User field
        cy.get('.btn').click() // Login button

        cy.get('li[active="tabs.BudgetTool.active"]').click() // Budget tool tab

        cy.get('.panel-body > :nth-child(1) > :nth-child(1) > .col-md-12 > .btn').click() // Click ResetButton 
        cy.get('#resetBudgetPlanModal > .modal-dialog > .modal-content > .modal-footer > .btn-primary').click() // Confirming ResetButton


        //Here is where ResetButton clear all data changind flag to FALSE //
        cy.wait('@refreshBudgetPlan').then((refresh => {
        cy.log(refresh)

        expect(refresh.request.body).to.eq('tid=2019-52195') // Checking if is the correct TID to reset
        expect(refresh.request.method).to.eq('POST') // Request Validation

        expect(refresh.response.statusCode).to.eq(200) // Status Validation
        expect(refresh.response.statusMessage).to.eq('OK') // Validating if request is available and up and running
        expect(refresh.response.body.summary).to.have.property('hasSavedBudget').to.eq(false) //< ------ THIS LINE SHOULD VALIDATE IF FLAG IS FALSE AFTER A BUDGET RESET

        }))
        // End of test //

    })

})