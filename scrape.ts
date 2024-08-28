import puppeteer from "puppeteer";

const URL =
    "https://github.com/search?q=%22%40solana%2Fweb3.js%22+OR+%22%40metaplex-foundation%2Fumi%22+NOT+.md+NOT+.mdx&type=code&ref=advsearch";

async function main() {
    const browser = await puppeteer.launch({ headless: false }); // Set to true for production
    const page = await browser.newPage();

    try {
        // Set the Authorization header with the Personal Access Token
        await page.setExtraHTTPHeaders({
            Authorization: `token ${process.env.GH_PAT}`,
        });

        // Navigate to a GitHub page that requires authentication
        await page.goto("https://github.com/settings/profile");

        // Check if login was successful
        const isLoggedIn = await page.evaluate(() => {
            return (
                document.querySelector(
                    ".Header-item.position-relative.mr-0 .avatar",
                ) !== null
            );
        });

        if (isLoggedIn) {
            console.log("Successfully authenticated");
            // Add your scraping logic here
            // For example:
            // await page.goto('https://github.com/your-target-repo');
            // const data = await page.evaluate(() => { ... });
        } else {
            console.log("Authentication failed");
        }
    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        await browser.close();
    }
}

main().catch((err) => {
    console.error("Aborting due to error:", err);
    process.exit(1);
});
