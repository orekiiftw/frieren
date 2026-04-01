const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying MedicalAccessControl...");

  const MedicalAccessControl = await hre.ethers.getContractFactory("MedicalAccessControl");
  const contract = await MedicalAccessControl.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`✅ MedicalAccessControl deployed to: ${address}`);

  const deploymentInfo = {
    contractAddress: address,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
  };

  const outputDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, `${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`📄 Deployment info saved to deployments/${hre.network.name}.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
