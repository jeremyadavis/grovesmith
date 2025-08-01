# Grovesmith – Product Requirements Document (PRD)

## Product Vision

Grovesmith is a polished, intuitive web application designed to teach financial literacy and responsible money management to children through structured allowance distribution. It is intentionally educational, emphasizing learning financial principles rather than linking money to chores. Initially built for personal use, the app should scale easily for broader use as a SaaS product.

---

## Target Audience

- **Primary Users:** Managers (parents, guardians, or sponsors)
- **Secondary Users:** Recipients (children or learners)

---

## User Roles

### Manager

- Create and manage recipients’ profiles.
- Set allowance schedules and automatic distributions.
- Allocate allowance across specific educational categories.
- Track and manage savings goals, investment simulation, and wishlist management.

### Recipient

- View allowance distribution across categories.
- View progress toward savings goals and wishlist items.
- View dividend simulation and investment tracking.
- No direct management actions; view-only access.

---

## Allowance System

- Allowance is educational, not chore-based.
- Weekly distribution calculated as half the recipient's age in dollars.
  - Example: A 10-year-old receives $5.00 weekly.
- Automatically adjusts as recipients age.

---

## Allowance Categories

Grovesmith will have 4 main categories that money will be divided into each allowance period. Users should be able to see high-level information about the amount of money in each category and then be able to select it to see other related things or to administer things within the category.

### 1. Give

- Overview: Money set aside to give to things like charity or church fundraisers.
- Learning Goal: Learn how to give purposefully and feel like they made a difference for a cause they care about.

### 2. Spend

- Overview: Untracked money used to give childen opportunity to make whim purchases
- Learning Goal: Teaches how to handle physical money and how to check-out in various situtations

### 3. Save

- Overview: Structured saving toward specific items.
- Overview: Teaches how to diligently save for a desired purchase and delayed gratification

### 4. Invest

- Teaches fundamental investing principles and compounding.

## Allowance Categories Details

### Give

The give category is there to ensure children are putting a portion of their allowance aside for unselfish reasons.
They need to find things that they want to contribute to like a charity or church fundraiser that they personally care about.
I prefer not to have this giving go to more generic things like tithing or large charity as I want them to feel some locus of control over how their money was directly correlated to some specific cause.

This category should have a way for users to add target charities or causes to give towards. It should have some kind of max number so that when a child gets for example, $20 saved up for that cause we take the money out to give it.

There should probably be a limit of 3 causes or organizations that can be added to ensure they are saving up for specific things and don't move on to the next one until the others have been given to.

### Spend

Spend category is to allow children the reward and pride of having money on their person when out at the store and can purchase whatever they want without needing to ask a parent for it.
it also is to teach them how to interact with cash register attendands or work the self-checkout registers.
They might also learn some control if they blow through their money on whim purchases enough times.
There is no tracking of where the money goes or what is purchased.
I do want to track total contributions to the Spend category and have ways to view it a few different timeperiods like monthly, annually, and all-time to encourage reflection and impulse control.Often they feel like they haven't had much money in spend but if they see that they'd acquired $100 in spend over the last year they'll be more likely to want to save up for something more meaningful.

### Save

Save category is to teach children how to save up for a desired purchase and delayed gratification.
The Save category should have a way to make subcategories such as "Clothes", "Books", "Toys", "Games", "Other", etc.
There is also a wishlist section that a child must add a purchase to before they can save up for it. This is helpful to remind them of what they want and also to help them learn to prioritize and delay gratification. Often they wind up not wanting the item as much as they thought they did when they come back the next week.

If an item stays on the list too long, then we talk about removing it. If we do remove items it would be good to keep it so they have a track record of how often they say they want something but never follow through.

Items on the wish list should have a name, an optional link to it, the category it belongs to, maybe a description and an approximate price. It should also have a visual progress indicator of how much they have saved up for it.

### Invest

Invest category is to teach children how to invest their money and the power of compounding interest.
For beginning to teach this, I want to simulate dividends at a rate of $0.05 per dollar invested and pay out divides twice a month on the 1st and 15th.

The app should automatically track accumulated dividends for each dividen payout period.

When a child reaches $50 in dividends, we should notify them that they've reached the limit.
At this point I open up a UGMA/UTMA account and we use that $50 to make real stocky purchases and track the growth there.
We start the invest section back over at $0 and they can continue contributing to it with the same rules as before.

Every $50 they take it out to purchase more individual stocks.

I would like to eventually put some kind of stock ticker tracker in grovesmith so they can see some simple charts or numbers on their investments without having to go to a third party site.

---

## Required Features & Functionalities

### Account Management

- Secure manager login and profile management.
- Simple recipient profiles with controlled visibility.
- Optional public view with anonymized details.

### Allowance Automation

- Weekly automatic distribution.
- Category-specific rules and minimum allocations enforced or suggested.

### Transaction & Balance Management

- Clear, visually appealing balance views (excluding transactional tracking in "Spend" category).
- Manager-managed adjustments and withdrawals for Give, Save, and Invest categories.
- Historical tracking and visualization for educational reflection.

### Wishlist & Savings Goals

- Ability to create, edit, and manage wishlist items.
- Historical record of wishlist management and spending decisions.
- Optional limits for wishlist entries per category.

### Investment Simulation

- Automatic dividend calculation and distribution.
- Historical dividend tracking and educational summaries.
- Threshold-based notifications for transitioning into actual investments.

---

## Customization & Scalability

- Families operate as isolated tenants.
- Customizable allowance rules, categories, and subcategories.
- Future-proof architecture for SaaS scalability.

---

## Design & User Experience

- Modern, clean, intuitive interface.
- Responsive across desktop, tablet, and mobile.
- Kid-friendly visuals, simplified dashboards.
- Clear, engaging representations of financial progress.

---

## Out of Scope

- Real-world monetary transactions or payment integrations.
- Chore/task management.
- Social networking or community interaction features.

---

## Implementation Status

### ✅ Completed Features
- **User Management**: Manager authentication and recipient creation
- **Profile System**: Personalized recipient profiles with themed headers
- **Distribution System**: Manual allowance distribution with date selection
- **Gamification**: Trophy achievement system with visual feedback
- **Database**: Complete schema with automatic balance management

### 🚧 Current Development
- **Category Features**: Individual category functionality (Give, Spend, Save, Invest)
- **Transaction History**: Detailed tracking and reporting per category
- **Advanced Distribution**: Auto-distribution with saved preferences

### 📋 Next Phases
- **Wishlist Management**: Save category with goal tracking
- **Investment Simulation**: Dividend system and real investment transitions
- **Charitable Integration**: Give category with cause selection
- **Mobile Optimization**: Enhanced responsive design and PWA features
