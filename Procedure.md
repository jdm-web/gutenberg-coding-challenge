# Procedure

## Installation

- Created the fork
- Cloned the fork
- Set up git flow
- Opened a feature branch
- cd into the directory
- Followed the readme setup instructions
	- `nvm install`
	- `npm install`
	- Noticed there were some fixable npm warnings, so decided to run `npm audit fix`
	- Fixed some errors, but several remained. I won't go for breaking change fixes at this point so decided to leave it like this for now.
	- `npm run env start`
	- `npm start`
- Visited the front at http://localhost:8888
- Noticed a register block type notice on the front end.
    - Seemed odd, so I looked into the `country-card-block.php` file, saw the `register_block_type` function call there pointing to the build folder.
    - Went to have a look at the `block.json` declaration, especially the name pattern, which looked fine.
    - As it was a format notice, I remembered that I saw formatting tools in `composer.json`
- Ran `composer install`
    - Noticed it installed phpcs rules
    - Modified the block.json file to see if the linting ran.
    - That fixed the register_block_type notice on the front end
    - The composer install command was not part of the readme installation process, decided to add it.
- Visited the admin at http://localhost:8888/wp-admin
- Logged in with the given credentials

## Trying to use the block

- Created a new post
- Added the country card block in the editor.
- Noticed it triggered an error in the console, which I noted to fix.
- I can't seem to be able to select the block, to remove it for example, wondered if it was related to the JS error.
- Tried to select a country (Belgium)
	- It changed effectively for a Belgium preview mode.
	- But the edit mode disappeared, and I was unable to change the country from then on.
	- Noted it was not a great user experience, and that it was not like the readme preview which was side by side. Wondered if I understood the Readme properly, but still, it missed the opportunity to change my country.
- Saved the post, and went to the frontend to see the rendering.
	- I could see the block preview on the frontend.

## Starting to debug

### Edit.js

- The js error occurring when selecting a plugin is annoying, I decided to go for it first.
- Seemed located in `src/edit.js`, which I opened.

- I use PhpStorm as my IDE, it colored the file in red because of format errors, proposed I fix the file thanks to prettier file rules, which I accepted.
- Wen to look into the `package.json` file, saw there were linting scripts available, decided to revert my edit.js manual linting fix, then run the `npm lint:js` task instead to see if it did the same.
- `npm run lint:js`
	- Told me there were 50 errors, 48 potentially fixable with the --fix option.
	- Decided to try it
	- npm run lint:js --fix
	- Didn't work, I assumed I didn't write the option properly, made some searches online, found the correct syntax.
	- `npm run lint:js -- --fix`
	- Fixed 48 errors.
- Went back to `edit.js` to see if it was properly formatted, it was.
- There were still two errors displayed by the linter :
	- First error: "4:1  error  `../assets/countries.json` import should occur after import of `@wordpress/i18n`  import/order"
        - Located the import in edit.js, tried to move it after the @wordpress/i18n one.
        - Reorganized the imports a bit to match the comments
        - It fixed the linting error
        - Went back to the post admin to check if it didn't introduce a breaking change, it didn't
	- Second error: "Translation function with placeholders is missing preceding translator comment."
		- Looked online how to fix that.
		- Found a way that worked.

- To check if the `getRelatedPosts` error was preventing correct usage of the block, it decided to comment the call out line 69.
	- The loading error wasn't there anymore, but I still couldn't move nor delete the block I inserted on the page.
	- Wondered if it was intentional, checked the block.json supports section, checked the documentation at https://developer.wordpress.org/block-editor/reference-guides/block-api/block-supports/ to see if I could add support to move or remove the block, even tried to remove the supports attribute from the block.json file, nothing worked.
	- On the readme.md screenshot, controls are present though. I decided to move on not to lose too much time and to come back to this later.

### Frontend Preview

- Next, I decided to look into the front-end rendering.
	- Re-added the country card into a post.
	- Chose France as a country.
	- Typed FR.
	- Tried to select France with my keyboard, lost keyboard focus, which closed the country selector. Thought it would be nice to add keyboard support for a greater user experience.
	- Selected France with the mouse this time, and saved the post.

- I compared the front preview with the screenshot.
	- It's wider, maybe we should add a max-width. The block doesn't look too good when it's too wide.
	- The font size seems smaller than the preview, and the preview font, thinner.
	- The bold text looks too bold.
	- The country code misses the dotted underline.
- When comparing the frontend preview and the admin one, we also see some differences that could be aligned. The admin font size is way bigger than the front one for example.

- Decided to check the CSS bits to see how it was coded, the coding standards, and see if I could change a few parts to better match the design.
	- Not much css declarations in editor.scss
	- Checked style.scss and noticed linting errors
	- Tried the `npm run lint:css` command
	- Reported 8 rather straightforward errors, so I decided to fix them with the --fix option
	- Added a max-width for the card
	- Noticed there were many repeating string declarations (for example border color), which I turned into variables.
	- My variable use had context issues, so I decided to better namespace the CSS declarations.
	- Tweaked a few CSS values to get closer to the design, and decided to go back to the edit.js file to analyze it deeper.

### Back to edit.js

- I read the edit.js file entirely and here's what I noticed.
	- Imports are numerous but seem all used, which is fine
	- Many consts are defined, they are at the top of the Edit function, which looks familiar
	- At first glance, I'm not sure I like the handleChangeCountry function very much. The condition seems odd to me, but I'm not sure why yet, so I decided to come back to it later
	- Wondered if the condition in handleChangeCountryCode could prevent state change, if it's wanted or not. To be checked later.
	- Not a fan of how the post id is retrieved from the URL. Wondered if there's not a native WordPress method to get this instead of a risky URL parsing.
	- The JSON URL is in 404. Wondered if it's the right one, wondered if there's a WordPress const for the REST URL to avoid writing it manually.
	- Found odd to declare the component with just a <> line. Maybe it's a declaration I don't know. I checked online and saw that it was a valid declaration, so no worries there.
	- I then see a BlockControls component declaration in the code, but I don't see it on the editor. Wondered why it doesn't work. I should see a change country button, but it's not there on screen.
	- Then there's the preview condition, with a Preview component, looks fine at first.
	- If not in preview mode we have the placeholder component, looks fine to me too.

- I decided to investigate further this missing BlockControls.
	- Found that the <div> declaration misses the `{ ...useBlockProps() }`, So I added it.
	- Glad to see it fixed the missing BlockControls element, I can now see the component controls, and notably the edit country button.
	- The edit button toggles effectively between the preview or edit mode.
	- The country is effectively changed when I go back to edit mode and select another country from the dropdown.

- Then I wanted to go back to the post request to get related posts
	- Looked into the WordPress developer handbook to see if there was a native method to interrogate the API.
	- Found https://developer.wordpress.org/block-editor/reference-guides/packages/packages-api-fetch/
	- Decided to use that, imported the library, and replaced the `window.fetch` call. Had to replace the error handler too because `response.ok` was not valid anymore.
	- It fixed the 404 I used to have on the API call.
	- Using `ApiFetch` saves some code lines too because it already parses the response as JSON.
	- Returned 0 related posts though. By the look of the query, I figured I needed to create some more posts, with the country-card in it, set up on the same country.
	- Got a new error when inserting a new card block on another post : TypeError: Cannot read properties of null (reading '1'). Saving that for later.
	- Decided to prefix the error the block throws by [country-card], so we know it comes from this block.
- Now that the related posts work again, I wanted to see if I could replace the line that gets the current post ID (`const postId = window.location.href.match( /post=([\d]+)/ )[ 1 ];`) by something native.
	- Searched in the doc and found : `const post_id = wp.data.select("core/editor").getCurrentPostId();`
	- Decided to have a go. It worked.
	- I felt this had something to do with the `TypeError: Cannot read properties of null (reading '1')` I had earlier, so I decided to check back on this.
	- Turned out using `wp.data.select("core/editor").getCurrentPostId()` solved this problem too.
- Decided to go have a deeper look at the preview component within the preview.js file
	- Decided to update the related post count text because I had only one related post, but it showed "There are 1 related posts"
	- I usually prefer when the code executed inside a loop is separated into another code block. I find it more readable. The `relatedPosts.map` for example, I would separate the code into a displaySingleRelatedPostLine for example. But I'm running out of time, and the code itself doesn't pose any particular problem besides readability, so I decided to leave it like this.
- I went back to the frontend to check the related posts, the list was there too.
- At this point, there are no more errors in the console, and the block is working as intended with different scenarios : (no related post, 1 related post, more than one).

## Submission

- I was out of time, so I decided to clean up my work for submission.
	- Ran the JavaScript linter
		- No more error
	- Ran the CSS linter
		- ok
	- The `npm run env start` command exposed a test environment. I was curious to see if there was any runnable test in the repository but did not find any. Could not find any test script in either package.json or composer.json.
	- Committed my changes in my feature branch.
	- Opened the pull request.
