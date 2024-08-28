import type { Endpoints } from "@octokit/types";
import { Octokit } from "octokit";

type SearchCodeResponse = Endpoints["GET /search/code"]["response"];

const octokit = new Octokit({ auth: process.env.GH_PAT });

const searchTerm = "@solana/web3.js";
const excludeExtensions = [".md", ".mdx"];

async function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchRepositories() {
    const data = new Map();

    try {
        const query = `"${searchTerm}" in:file ${excludeExtensions.map((ext) => `-extension:${ext}`).join(" ")}`;
        console.log(`Searching query: ${query}`);

        const response = await octokit.rest.search.code({
            q: query,
            per_page: 100,
            page: 999,
        });

        if (response.data.items.length === 0) {
            console.log("No results found:", response);
        }

        const repos = response.data
            .items as SearchCodeResponse["data"]["items"];

        console.log(`Total count: ${response.data.total_count}`);
        console.log(`Items in this page: ${response.data.items.length}`);

        for (const repo of repos) {
            if (!data.has(repo.repository.full_name)) {
                const entry = {
                    url_stars: repo.repository.stargazers_url.replace(
                        /{.*}$/,
                        "",
                    ),
                    url_commits: repo.repository.commits_url.replace(
                        /{.*}$/,
                        "",
                    ),
                    url_forks: repo.repository.forks_url.replace(/{.*}$/, ""),
                };

                data.set(repo.repository.full_name, entry);
                console.log(
                    `Found: ${repo.repository.full_name} ${JSON.stringify(entry, null, 2)}`,
                );
            }
        }
    } catch (error) {
        console.error("Error searching: ", error);
    }

    return data;
}

async function main() {
    try {
        const repositories = await searchRepositories();

        console.log(`Total unique repositories found: ${repositories.size}`);
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

await main().catch((err) => {
    console.error(err);
    process.exit(1);
});
