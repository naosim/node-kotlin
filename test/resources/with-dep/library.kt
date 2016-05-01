package library

fun fibonacci(n: Int): Int = when (n) {
  1, 2 -> 1
  else -> fibonacci(n - 1) + fibonacci(n - 2)
}
