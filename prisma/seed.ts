import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seeding...')

  // Crear categorías
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'camisetas' },
      update: {},
      create: {
        name: 'Camisetas',
        slug: 'camisetas',
        description: 'Camisetas urbanas, oversized y streetwear'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'hoodies' },
      update: {},
      create: {
        name: 'Hoodies',
        slug: 'hoodies',
        description: 'Sudaderas con capucha y crewnecks'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'pantalones' },
      update: {},
      create: {
        name: 'Pantalones',
        slug: 'pantalones',
        description: 'Jeans, joggers y pantalones cargo'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'sneakers' },
      update: {},
      create: {
        name: 'Sneakers',
        slug: 'sneakers',
        description: 'Zapatillas urbanas y deportivas'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'accesorios' },
      update: {},
      create: {
        name: 'Accesorios',
        slug: 'accesorios',
        description: 'Gorras, mochilas y complementos urbanos'
      }
    })
  ])

  console.log('✅ Categorías creadas:', categories.length)

  // Crear productos
  const products = [
    // Camisetas
    {
      name: 'Camiseta Oversized "Urban Vibes"',
      price: 45.99,
      discountPrice: 39.99,
      description: 'Camiseta oversized 100% algodón con estampado streetwear',
      images: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop,https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&h=600&fit=crop',
      sizes: 'S,M,L,XL,XXL',
      colors: 'Negro,Blanco,Gris',
      stock: 25,
      featured: true,
      slug: 'camiseta-oversized-urban-vibes',
      rating: 4.5,
      categoryId: categories[0].id
    },
    {
      name: 'Tee Básica Premium',
      price: 29.99,
      description: 'Camiseta básica de corte relajado, perfecta para el día a día',
      images: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&h=600&fit=crop',
      sizes: 'S,M,L,XL',
      colors: 'Negro,Blanco,Navy,Gris',
      stock: 40,
      featured: false,
      slug: 'tee-basica-premium',
      rating: 4.2,
      categoryId: categories[0].id
    },
    {
      name: 'Camiseta Vintage "90s Retro"',
      price: 39.99,
      description: 'Camiseta con diseño vintage inspirado en los 90s',
      images: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=600&fit=crop,https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&h=600&fit=crop',
      sizes: 'S,M,L,XL',
      colors: 'Vintage White,Faded Black,Retro Blue',
      stock: 15,
      featured: true,
      slug: 'camiseta-vintage-90s-retro',
      rating: 4.7,
      categoryId: categories[0].id
    },
    
    // Hoodies
    {
      name: 'Hoodie "City Lights"',
      price: 89.99,
      discountPrice: 79.99,
      description: 'Sudadera con capucha, diseño urbano y bolsillo canguro',
      images: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=600&fit=crop,https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=600&fit=crop',
      sizes: 'S,M,L,XL,XXL',
      colors: 'Negro,Gris Oscuro,Navy',
      stock: 20,
      featured: true,
      slug: 'hoodie-city-lights',
      rating: 4.6,
      categoryId: categories[1].id
    },
    {
      name: 'Crewneck Minimalista',
      price: 75.99,
      description: 'Sudadera sin capucha, diseño clean y moderno',
      images: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&h=600&fit=crop',
      sizes: 'S,M,L,XL',
      colors: 'Beige,Negro,Blanco Roto',
      stock: 18,
      featured: false,
      slug: 'crewneck-minimalista',
      rating: 4.3,
      categoryId: categories[1].id
    },
    {
      name: 'Hoodie Oversized "Street King"',
      price: 99.99,
      description: 'Hoodie oversized con estampado exclusivo',
      images: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=600&fit=crop,https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=600&fit=crop',
      sizes: 'M,L,XL,XXL',
      colors: 'Negro,Gris',
      stock: 12,
      featured: true,
      slug: 'hoodie-oversized-street-king',
      rating: 4.8,
      categoryId: categories[1].id
    },
    
    // Pantalones
    {
      name: 'Jeans Slim Fit Black',
      price: 79.99,
      description: 'Jeans negros de corte slim, perfectos para cualquier ocasión',
      images: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=600&fit=crop,https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&h=600&fit=crop',
      sizes: '28,30,32,34,36,38',
      colors: 'Negro,Negro Desgastado',
      stock: 30,
      featured: false,
      slug: 'jeans-slim-fit-black',
      rating: 4.4,
      categoryId: categories[2].id
    },
    {
      name: 'Joggers "Comfort Zone"',
      price: 59.99,
      description: 'Pantalones joggers cómodos para el día a día',
      images: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=600&fit=crop',
      sizes: 'S,M,L,XL,XXL',
      colors: 'Gris,Negro,Navy',
      stock: 35,
      featured: false,
      slug: 'joggers-comfort-zone',
      rating: 4.1,
      categoryId: categories[2].id
    },
    {
      name: 'Cargo Pants Tactical',
      price: 89.99,
      description: 'Pantalones cargo con múltiples bolsillos, estilo urbano',
      images: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&h=600&fit=crop,https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=600&fit=crop',
      sizes: 'S,M,L,XL',
      colors: 'Verde Militar,Negro,Khaki',
      stock: 22,
      featured: true,
      slug: 'cargo-pants-tactical',
      rating: 4.5,
      categoryId: categories[2].id
    },
    
    // Sneakers
    {
      name: 'Air Force 1 Classic',
      price: 129.99,
      discountPrice: 119.99,
      description: 'Zapatillas clásicas blancas, un must-have urbano',
      images: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=600&fit=crop,https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500&h=600&fit=crop',
      sizes: '38,39,40,41,42,43,44,45',
      colors: 'Blanco,Negro,Blanco/Negro',
      stock: 50,
      featured: true,
      slug: 'air-force-1-classic',
      rating: 4.7,
      categoryId: categories[3].id
    },
    {
      name: 'Jordan 1 Retro High',
      price: 189.99,
      description: 'Icónicas Jordan 1 en colorway clásico',
      images: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=500&h=600&fit=crop,https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500&h=600&fit=crop',
      sizes: '38,39,40,41,42,43,44,45',
      colors: 'Chicago,Bred,Royal Blue',
      stock: 25,
      featured: true,
      slug: 'jordan-1-retro-high',
      rating: 4.9,
      categoryId: categories[3].id
    },
    {
      name: 'Yeezy Boost 350',
      price: 249.99,
      description: 'Sneakers Yeezy con tecnología Boost',
      images: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500&h=600&fit=crop,https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&h=600&fit=crop',
      sizes: '38,39,40,41,42,43,44',
      colors: 'Cream White,Core Black,Zebra',
      stock: 15,
      featured: true,
      slug: 'yeezy-boost-350',
      rating: 4.8,
      categoryId: categories[3].id
    },
    
    // Accesorios
    {
      name: 'Gorra Snapback "Urban"',
      price: 34.99,
      description: 'Gorra snapback con bordado exclusivo',
      images: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=500&h=600&fit=crop,https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=600&fit=crop',
      sizes: 'Única',
      colors: 'Negro,Navy,Gris',
      stock: 40,
      featured: false,
      slug: 'gorra-snapback-urban',
      rating: 4.2,
      categoryId: categories[4].id
    },
    {
      name: 'Mochila Streetwear',
      price: 69.99,
      discountPrice: 59.99,
      description: 'Mochila urbana con compartimentos múltiples',
      images: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=600&fit=crop,https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=500&h=600&fit=crop',
      sizes: 'Única',
      colors: 'Negro,Gris Oscuro,Camuflaje',
      stock: 28,
      featured: true,
      slug: 'mochila-streetwear',
      rating: 4.4,
      categoryId: categories[4].id
    },
    {
      name: 'Riñonera "City Pack"',
      price: 39.99,
      description: 'Riñonera compacta para llevar lo esencial',
      images: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=600&fit=crop',
      sizes: 'Única',
      colors: 'Negro,Gris,Verde Militar',
      stock: 35,
      featured: false,
      slug: 'rinonera-city-pack',
      rating: 4.0,
      categoryId: categories[4].id
    }
  ]

  for (const productData of products) {
    const existingProduct = await prisma.product.findFirst({
      where: { name: productData.name }
    })
    
    if (!existingProduct) {
      await prisma.product.create({
        data: productData
      })
    }
  }

  console.log('✅ Productos creados:', products.length)
  console.log('🎉 Seeding completado!')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })