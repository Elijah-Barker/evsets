(module
    (import "env" "mem" (memory 2048 2048 shared))
    (export "wasm_hit" (func $hit))
    (export "wasm_miss" (func $miss))
    (export "wasm_timer" (func $timer))

    (func $timer (result i64)
        (i64.load (i32.const 256))
    return)

    (func $hit (param $victim i32) (result i64)
        (local $t0 i64)
        (local $t1 i64)
        (local $td i64)
        ;; acces victim
        (local.set $td (i64.load (i32.and (i32.const 0xffffffff) (local.get $victim))))
        ;; t0 (mem[0])
        (local.set $t0 (i64.load (i32.and (i32.const 0xffffffff) (i32.or (i32.const 256) (i32.eqz (i64.eqz (local.get $td)))))))
        ;; re-access
        (local.set $td (i64.load (i32.and (i32.const 0xffffffff) (i32.or (local.get $victim) (i64.eqz (local.get $t0))))))
        ;; t1 (mem[0])
        (local.set $t1 (i64.load (i32.and (i32.const 0xffffffff) (i32.or (i32.const 256) (i32.eqz (i64.eqz (local.get $td)))))))
        (i64.sub (local.get $t1) (local.get $t0))
        return)

    (func $miss (param $victim i32) (param $ptr i32) (result i64)
        (local $t0 i64)
        (local $t1 i64)
        (local $td i64)
        ;; acces victim
        (local.set $td (i64.load (i32.and (i32.const 0xffffffff) (local.get $victim))))
		;; traverse
        (local.set $td (i64.extend_i32_u (i32.or (i32.eqz (i64.eqz (local.get $td))) (local.get $ptr))))
        loop $iter
            (local.set $td (i64.load (i32.wrap_i64 (local.get $td))))
            (br_if $iter (i32.eqz (i64.eqz (local.get $td))))
        end
        ;; t0 (mem[0])
        (local.set $t0 (i64.load (i32.and (i32.const 0xffffffff) (i32.or (i32.const 256) (i32.eqz (i64.eqz (local.get $td)))))))
        ;; re-access
        (local.set $td (i64.load (i32.and (i32.const 0xffffffff) (i32.or (local.get $victim) (i64.eqz (local.get $t0))))))
        ;; t1 (mem[0])
        (local.set $t1 (i64.load (i32.and (i32.const 0xffffffff) (i32.or (i32.const 256) (i32.eqz (i64.eqz (local.get $td)))))))
        (i64.sub (local.get $t1) (local.get $t0))
        return)
)
