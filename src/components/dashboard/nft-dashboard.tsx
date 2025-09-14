"use client"

import React, { useState, useEffect } from "react"
import { useWallet } from "@/components/providers/wallet-provider"

// Mock NFT data
interface NFTItem {
  id: number
  name: string
  tokenId: number
  image: string
  contractAddress: string
  floorPrice: string
  lastPrice: string
  traits: Array<{ trait_type: string; value: string }>
  collection: string
}

interface NFTCollectionStats {
  name: string
  contractAddress: string
  totalSupply: number
  floorPrice: string
  volume24h: string
  minted: number
  listed: number
  royaltyPercentage: number
}

export function NFTDashboard() {
  const { address, isConnected } = useWallet()
  const [activeTab, setActiveTab] = useState('collections')
  const [nfts, setNfts] = useState<NFTItem[]>([])
  const [collections, setCollections] = useState<NFTCollectionStats[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data loading
  useEffect(() => {
    const loadNFTData = async () => {
      setLoading(true)

      // Simulate API loading
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock NFT collections
      const mockCollections: NFTCollectionStats[] = [
        {
          name: "My Awesome NFTs",
          contractAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44",
          totalSupply: 10000,
          floorPrice: "0.08",
          volume24h: "2.1",
          minted: 2468,
          listed: 1250,
          royaltyPercentage: 5
        },
        {
          name: "Crypto Punks Clone",
          contractAddress: "0x8ba1f109551bD432803012645261768374f9BAc0",
          totalSupply: 5000,
          floorPrice: "0.25",
          volume24h: "5.4",
          minted: 1423,
          listed: 890,
          royaltyPercentage: 3
        }
      ]

      // Mock NFTs
      const mockNFTs: NFTItem[] = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        name: `NFT #${i + 1}`,
        tokenId: i + 1,
        image: `https://via.placeholder.com/256x256?text=NFT+${i + 1}`,
        contractAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44",
        floorPrice: (0.05 + Math.random() * 0.1).toFixed(3),
        lastPrice: (0.03 + Math.random() * 0.05).toFixed(3),
        traits: [
          { trait_type: "Background", value: "Blue" },
          { trait_type: "Eyes", value: "Happy" },
          { trait_type: "Mouth", value: "Smile" }
        ],
        collection: "My Awesome NFTs"
      }))

      setCollections(mockCollections)
      setNfts(mockNFTs)
      setLoading(false)
    }

    if (isConnected) {
      loadNFTData()
    }
  }, [isConnected])

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Connect your wallet to view your NFT collections and manage your digital assets
        </p>
        <div className="text-6xl mb-4">🎨</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading your NFTs...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{collections.length}</div>
              <div className="text-purple-100">Collections</div>
            </div>
            <div className="text-3xl">🗂️</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{nfts.length}</div>
              <div className="text-green-100">Owned NFTs</div>
            </div>
            <div className="text-3xl">🖼️</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {collections.reduce((sum, col) => sum + parseFloat(col.floorPrice), 0).toFixed(2)}
              </div>
              <div className="text-yellow-100">Floor Total (ETH)</div>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-rose-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">+12%</div>
              <div className="text-pink-100">Value Change</div>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          {[
            { id: 'collections', label: 'My Collections', icon: '🗂️' },
            { id: 'nfts', label: 'My NFTs', icon: '🖼️' },
            { id: 'analytics', label: 'Analytics', icon: '📊' },
            { id: 'minting', label: 'Minting Tools', icon: '🔨' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 font-medium text-sm mr-6 ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Collections Tab */}
        {activeTab === 'collections' && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {collections.map((collection, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-600 rounded-lg mr-4"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{collection.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {collection.contractAddress.slice(0, 6)}...{collection.contractAddress.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{collection.totalSupply.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total Supply</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{collection.floorPrice} ETH</div>
                      <div className="text-sm text-gray-600">Floor Price</div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium">
                      Manage
                    </button>
                    <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded font-medium">
                      Mint New
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {collections.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🗂️</div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Collections Yet</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create your first NFT collection using our creator tools
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
                  Create Collection
                </button>
              </div>
            )}
          </div>
        )}

        {/* NFTs Tab */}
        {activeTab === 'nfts' && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {nfts.map((nft) => (
                <div key={nft.id} className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center">
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">{nft.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">#{nft.tokenId}</p>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Floor:</span>
                      <span className="font-medium">{nft.floorPrice} ETH</span>
                    </div>

                    <div className="mt-3 space-y-2">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded text-xs font-medium">
                        Transfer
                      </button>
                      <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-1.5 rounded text-xs font-medium">
                        List for Sale
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {nfts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🖼️</div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No NFTs Yet</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start minting your first NFTs from your collections
                </p>
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium">
                  Mint First NFT
                </button>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Portfolio Value Chart Placeholder */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Portfolio Value</h4>
                <div className="h-64 bg-gradient-to-t from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-900/40 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📈</div>
                    <p className="font-medium text-green-700 dark:text-green-400">+12.5% This Month</p>
                    <p className="text-sm text-gray-600">Value chart would display here</p>
                  </div>
                </div>
              </div>

              {/* Sales History */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Sales</h4>
                <div className="space-y-3">
                  {[
                    { name: "NFT #1456", price: "0.08 ETH", date: "2 hours ago", type: "sold" },
                    { name: "NFT #892", price: "0.12 ETH", date: "1 day ago", type: "bought" },
                    { name: "NFT #421", price: "0.09 ETH", date: "3 days ago", type: "sold" }
                  ].map((sale, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{sale.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{sale.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{sale.price}</div>
                        <div className={`text-sm ${sale.type === 'sold' ? 'text-green-600' : 'text-blue-600'}`}>
                          {sale.type}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Minting Tools Tab */}
        {activeTab === 'minting' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg text-center">
                <div className="text-4xl mb-4">🎨</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Batch Minting</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Mint multiple NFTs at once with custom metadata
                </p>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium">
                  Start Batch Mint
                </button>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-6 rounded-lg text-center">
                <div className="text-4xl mb-4">📝</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Metadata Editor</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Create and edit NFT metadata with trait configuration
                </p>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium">
                  Edit Metadata
                </button>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-lg text-center">
                <div className="text-4xl mb-4">🚀</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">AIRDROP</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Send NFTs to multiple addresses in bulk
                </p>
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded font-medium">
                  Create Airdrop
                </button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-4">⚡ Quick Mint Options</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  "1 NFT", "5 NFTs", "10 NFTs", "Custom Amount"
                ].map((option, index) => (
                  <button
                    key={index}
                    className="bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-4 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{option}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Mint Now</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
