// Program description

// Periodicially fetch data from different NFT lending sites (NFTfi, Sudoswap, etc)

// Compare the ask price for borrowers to the floor price of a given NFT collection

// If price is sufficiently lower than floor and a discord bot key is provided, send a message from the bot to owner
import {
    GetCollectionStats,
    GetSlug,
    NFTFiListingsForProject,
    NFTFiProjects,
    NFTFiTotalListings,
    VerifyNTFfiListings,
} from './utils'
import { AllNFTFiListingsForProject, VerifyNFTfiProjects } from './utils/NFTFi';
import moment from 'moment'
main();

async function main() {
    // First get all the verified projects
    const projects = await NFTFiProjects();
    const verified_projects = VerifyNFTfiProjects(projects);

    console.log(`Detected ${projects.length} projects of which ${verified_projects.length} are verified from NFTFi`);

    // Now get the listings for each verified project
    const listings = await NFTFiTotalListings();
    const verified_project_listings = VerifyNTFfiListings(verified_projects, listings);
    
    const best_NFTFi_listings = [];

    // Check each verified listing for lowest ask price
    console.log(`\nScraping best active listings from NFTFi... this may take a second...`);
    
    let x = 0;
    let started_at = Date.now();
    for (const project_listing of verified_project_listings) {

        x++;
        if(x % 10 == 0) console.log(`Checking listing ${x} of ${verified_project_listings.length}... (${moment().diff(started_at, 'seconds')}s)`);
        
        // Get detailed listings for this project
        const project_listings = await AllNFTFiListingsForProject(project_listing._id, project_listing.count);
        const listings_with_desiredLoanPrincipalAmount_weth = project_listings.filter(l => !!l.desiredLoanPrincipalAmount && l.desiredLoanCurrency == "wETH");

        // Find the lowest ask price for this project
        const lowestAskPricewETH = listings_with_desiredLoanPrincipalAmount_weth.reduce((lowest, current) => {
            if(!lowest) return current;
            return Number(lowest.desiredLoanPrincipalAmount || 0) < Number(current.desiredLoanPrincipalAmount || 0) ? lowest : current;
        }, null as any);

        if(!lowestAskPricewETH) continue;

        // Get the opensea slug for the project
        const slug = await GetSlug(project_listing._id);

        // Get the collection stats for the project (floor price, etc)
        const {stats} = await GetCollectionStats(slug);

        // Push best option for the project to the array
        best_NFTFi_listings.push({
            projectName: lowestAskPricewETH.projectName,
            desiredPrinciple: (Number(lowestAskPricewETH.desiredLoanPrincipalAmount) / 1e18 )+ " wETH",
            floorPrice: (Number(stats.floor_price))+ " wETH",
            sevenDaySales: stats.seven_day_sales,
            desiredLoanDuration: lowestAskPricewETH.desiredLoanDuration ? lowestAskPricewETH.desiredLoanDuration + " days" : undefined,
            timeSinceListed: lowestAskPricewETH.listedDate ? moment(lowestAskPricewETH.listedDate).fromNow() : undefined,
            link: `https://app.nftfi.com/assets/${lowestAskPricewETH.nftCollateralContract}/${lowestAskPricewETH.nftCollateralId}`,
            dateListed: lowestAskPricewETH.listedDate ? new Date(lowestAskPricewETH.listedDate).getTime() : 1e20,
        })    
    }

    console.log("\nDone scraping NFTFi! (took " + moment().diff(started_at, 'seconds') + "s)");
    
    console.log("Filtering listings that are not cheaper than floor price...\n");
    await new Promise(resolve => setTimeout(resolve, 1700));
    
    // filter out listings that are not cheaper than floor price
    const listings_with_desiredLoanPrincipalAmount_weth = best_NFTFi_listings.filter(
        x => {
            const floor = Number(x.floorPrice.split(" ")[0]);
            const ask = Number(x.desiredPrinciple.split(" ")[0]);
            return ask <= floor;
        });
    
    // Sort by most recent
    const sorted_NFTFi_listings = listings_with_desiredLoanPrincipalAmount_weth.sort((a, b) => {
        return a.dateListed - b.dateListed;
    }).reverse();

    // Print out the listings
    console.table(sorted_NFTFi_listings.map(l => {
        let x: any = {...l}
        x.projectName = x.projectName.length > 15 ? x.projectName.substring(0, 12) + "..." : x.projectName;
        delete x['dateListed'];
        return x;
    }));

    console.log(`\nShowing best listings for ${sorted_NFTFi_listings.length} projects, all of which are cheaper than floor price on OpenSea!`);
    
    await new Promise(resolve => setTimeout(resolve, 1700));
    console.log(`\n"Thanks for using NFTFi x OpenSea arbitrage!" - CreativeBuilds ♥`)
}
