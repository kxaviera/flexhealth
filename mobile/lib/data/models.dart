class Product {
  final String id;
  final String name;
  final String brand;
  final String category;
  final double price;
  final double? originalPrice;
  final String image;
  final String? shortDescription;
  final String? description;
  final String? badge;
  final bool inStock;
  final bool isPopular;
  final bool isSale;
  final bool isNew;
  final String? sku;

  const Product({
    required this.id,
    required this.name,
    required this.brand,
    required this.category,
    required this.price,
    this.originalPrice,
    required this.image,
    this.shortDescription,
    this.description,
    this.badge,
    this.inStock = true,
    this.isPopular = false,
    this.isSale = false,
    this.isNew = false,
    this.sku,
  });

  int? get discountPercent {
    if (originalPrice == null || originalPrice! <= price) return null;
    return (((originalPrice! - price) / originalPrice!) * 100).round();
  }

  factory Product.fromJson(Map<String, dynamic> j) {
    return Product(
      id: '${j['id'] ?? ''}',
      name: '${j['name'] ?? ''}',
      brand: '${j['brand'] ?? ''}',
      category: '${j['category'] ?? ''}',
      price: (j['price'] as num?)?.toDouble() ?? 0,
      originalPrice: (j['originalPrice'] as num?)?.toDouble(),
      image: '${j['image'] ?? j['imageUrl'] ?? ''}',
      shortDescription: j['shortDescription']?.toString(),
      description: j['description']?.toString(),
      badge: j['badge']?.toString(),
      inStock: j['inStock'] != false,
      isPopular: j['isPopular'] == true,
      isSale: j['isSale'] == true,
      isNew: j['isNew'] == true,
      sku: j['sku']?.toString(),
    );
  }
}

class Category {
  final String id;
  final String name;
  final String icon;
  final String desc;

  const Category({required this.id, required this.name, this.icon = '📦', this.desc = ''});

  factory Category.fromJson(Map<String, dynamic> j) => Category(
        id: '${j['id']}',
        name: '${j['name']}',
        icon: '${j['icon'] ?? '📦'}',
        desc: '${j['desc'] ?? ''}',
      );
}

class Brand {
  final String id;
  final String name;
  final String? logo;

  const Brand({required this.id, required this.name, this.logo});

  factory Brand.fromJson(Map<String, dynamic> j) => Brand(
        id: '${j['id']}',
        name: '${j['name']}',
        logo: j['logo']?.toString(),
      );
}

class BannerSlide {
  final String title;
  final String subtitle;
  final String cta;
  final String link;
  final String tag;
  final String image;

  const BannerSlide({
    required this.title,
    required this.subtitle,
    required this.cta,
    required this.link,
    required this.tag,
    required this.image,
  });

  factory BannerSlide.fromJson(Map<String, dynamic> j) => BannerSlide(
        title: '${j['title'] ?? ''}',
        subtitle: '${j['subtitle'] ?? ''}',
        cta: '${j['cta'] ?? 'Shop Now'}',
        link: '${j['link'] ?? 'shop.html'}',
        tag: '${j['tag'] ?? 'Flex Health'}',
        image: '${j['image'] ?? ''}',
      );
}

class OfferBanner {
  final String productId;
  final String theme;
  final String tag;
  final String headline;
  final String subline;
  final Product? embeddedProduct;

  const OfferBanner({
    required this.productId,
    this.theme = 'flex',
    this.tag = 'Special Offer',
    this.headline = '',
    this.subline = '',
    this.embeddedProduct,
  });

  factory OfferBanner.fromJson(Map<String, dynamic> j) => OfferBanner(
        productId: '${j['productId'] ?? j['product']?['id'] ?? ''}',
        theme: '${j['theme'] ?? 'flex'}',
        tag: '${j['tag'] ?? 'Special Offer'}',
        headline: '${j['headline'] ?? ''}',
        subline: '${j['subline'] ?? ''}',
        embeddedProduct: j['product'] is Map ? Product.fromJson(Map<String, dynamic>.from(j['product'])) : null,
      );
}

class PromoSlide {
  final String productId;
  final String type;
  final String label;
  final String headline;
  final String subline;
  final Product? embeddedProduct;

  const PromoSlide({
    required this.productId,
    this.type = 'daily',
    this.label = 'Special Offer',
    this.headline = '',
    this.subline = '',
    this.embeddedProduct,
  });

  factory PromoSlide.fromJson(Map<String, dynamic> j) => PromoSlide(
        productId: '${j['productId'] ?? j['product']?['id'] ?? ''}',
        type: '${j['type'] ?? 'daily'}',
        label: '${j['label'] ?? 'Special Offer'}',
        headline: '${j['headline'] ?? ''}',
        subline: '${j['subline'] ?? ''}',
        embeddedProduct: j['product'] is Map ? Product.fromJson(Map<String, dynamic>.from(j['product'])) : null,
      );
}

class Catalog {
  final List<Product> products;
  final List<Category> categories;
  final List<Brand> brands;
  final List<BannerSlide> banners;
  final List<OfferBanner> offerBanners;
  final List<PromoSlide> promoSlides;
  final List<Map<String, dynamic>> reviews;
  final Map<String, dynamic>? siteSettings;

  const Catalog({
    required this.products,
    required this.categories,
    required this.brands,
    required this.banners,
    this.offerBanners = const [],
    this.promoSlides = const [],
    this.reviews = const [],
    this.siteSettings,
  });

  Product? resolveProduct(String id, {Product? fallback}) {
    try {
      return products.firstWhere((p) => p.id == id);
    } catch (_) {
      return fallback;
    }
  }

  factory Catalog.fromJson(Map<String, dynamic> j) {
    return Catalog(
      products: (j['products'] as List? ?? []).map((e) => Product.fromJson(Map<String, dynamic>.from(e))).toList(),
      categories: (j['categories'] as List? ?? []).map((e) => Category.fromJson(Map<String, dynamic>.from(e))).toList(),
      brands: (j['brands'] as List? ?? []).map((e) => Brand.fromJson(Map<String, dynamic>.from(e))).toList(),
      banners: (j['banners'] as List? ?? []).map((e) => BannerSlide.fromJson(Map<String, dynamic>.from(e))).toList(),
      offerBanners: (j['offerBanners'] as List? ?? []).map((e) => OfferBanner.fromJson(Map<String, dynamic>.from(e))).toList(),
      promoSlides: (j['promoSlides'] as List? ?? []).map((e) => PromoSlide.fromJson(Map<String, dynamic>.from(e))).toList(),
      reviews: (j['reviews'] as List? ?? []).map((e) => Map<String, dynamic>.from(e)).toList(),
      siteSettings: j['siteSettings'] is Map ? Map<String, dynamic>.from(j['siteSettings']) : null,
    );
  }
}

class CartLine {
  final Product product;
  final int qty;

  const CartLine({required this.product, required this.qty});

  double get lineTotal => product.price * qty;

  CartLine copyWith({int? qty}) => CartLine(product: product, qty: qty ?? this.qty);
}

class UserSession {
  final String userId;
  final String name;
  final String? email;
  final String phone;

  const UserSession({
    required this.userId,
    required this.name,
    this.email,
    required this.phone,
  });

  factory UserSession.fromJson(Map<String, dynamic> j) => UserSession(
        userId: '${j['userId'] ?? j['id'] ?? ''}',
        name: '${j['name'] ?? ''}',
        email: j['email']?.toString(),
        phone: '${j['phone'] ?? ''}',
      );

  Map<String, dynamic> toJson() => {
        'userId': userId,
        'name': name,
        'email': email,
        'phone': phone,
      };
}

class OrderSummary {
  final String id;
  final String status;
  final double total;
  final String payment;
  final String? paymentStatus;
  final DateTime? date;
  final List<Map<String, dynamic>> items;
  final Map<String, dynamic>? customer;
  final String? awb;
  final String? courierName;
  final String? trackingUrl;

  const OrderSummary({
    required this.id,
    required this.status,
    required this.total,
    required this.payment,
    this.paymentStatus,
    this.date,
    this.items = const [],
    this.customer,
    this.awb,
    this.courierName,
    this.trackingUrl,
  });

  factory OrderSummary.fromJson(Map<String, dynamic> j) {
    return OrderSummary(
      id: '${j['id']}',
      status: '${j['status'] ?? 'placed'}',
      total: (j['total'] as num?)?.toDouble() ?? 0,
      payment: '${j['payment'] ?? 'cod'}',
      paymentStatus: j['paymentStatus']?.toString(),
      date: j['date'] != null ? DateTime.tryParse('${j['date']}') : null,
      items: (j['items'] as List? ?? []).map((e) => Map<String, dynamic>.from(e)).toList(),
      customer: j['customer'] is Map ? Map<String, dynamic>.from(j['customer']) : null,
      awb: j['awb']?.toString(),
      courierName: j['courierName']?.toString(),
      trackingUrl: j['trackingUrl']?.toString(),
    );
  }
}
