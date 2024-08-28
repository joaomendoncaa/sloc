import ky from "ky";

const GITHUB_TOKEN = process.env.GH_PAT;
const SEARCH_QUERY = "@solana/web3.js";
const EXCLUDED_EXTENSIONS = [".md", ".mdx"];

const fetchRepositories = async (query: string, page = 1) => {
    const url = "https://api.github.com/search/code";
    const response = await ky
        .get(url, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: "application/vnd.github.v3+json",
            },
            searchParams: {
                q: `${query} -extension:${EXCLUDED_EXTENSIONS.join(" -extension:")}`,
                per_page: 100,
                page,
            },
        })
        .json();

    return response;
};

const fetchRepoDetails = async (fullName: string) => {
    const repoUrl = `https://api.github.com/repos/${fullName}`;
    const commitsUrl = `https://api.github.com/repos/${fullName}/commits`;

    const [repoResponse, commitsResponse]: any = await Promise.all([
        ky
            .get(repoUrl, {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                    Accept: "application/vnd.github.v3+json",
                },
            })
            .json(),
        ky
            .get(commitsUrl, {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                    Accept: "application/vnd.github.v3+json",
                },
                searchParams: {
                    per_page: 1,
                },
            })
            .json(),
    ]);

    const latestCommitDate = commitsResponse[0].commit.author.date;

    return {
        name: repoResponse.full_name,
        stars: repoResponse.stargazers_count,
        forks: repoResponse.forks_count,
        latest_commit: latestCommitDate,
    };
};

const main = async () => {
    let page = 1;
    const uniqueRepos = new Set();
    const results = [];

    while (true) {
        const data: any = await fetchRepositories(SEARCH_QUERY, page);

        for (const item of data.items) {
            const repoFullName = item.repository.full_name;
            if (!uniqueRepos.has(repoFullName)) {
                uniqueRepos.add(repoFullName);
                const repoDetails = await fetchRepoDetails(repoFullName);
                results.push(repoDetails);
            }
        }

        if (data.items.length < 100) break;
        page++;
    }

    console.log(results);
};

main().catch(console.error);
