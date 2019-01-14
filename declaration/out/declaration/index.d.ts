import * as t from '../src';
export declare const T5: t.TypeC<{
    e: t.TypeC<{
        d: t.TypeC<{
            c: t.TypeC<{
                b: t.TypeC<{
                    a: t.StringC;
                }>;
            }>;
        }>;
    }>;
}>;
export declare const R1: t.RefinementC<t.TypeC<{
    e: t.TypeC<{
        d: t.TypeC<{
            c: t.TypeC<{
                b: t.TypeC<{
                    a: t.StringC;
                }>;
            }>;
        }>;
    }>;
}>>;
declare type R = {
    a: number;
    b: R | undefined | null;
};
export declare const Rec1: t.RecursiveType<t.Type<R, R, unknown>, R, R, unknown>;
export declare const A1: t.ArrayC<t.TypeC<{
    e: t.TypeC<{
        d: t.TypeC<{
            c: t.TypeC<{
                b: t.TypeC<{
                    a: t.StringC;
                }>;
            }>;
        }>;
    }>;
}>>;
export declare const P5: t.PartialC<{
    e: t.PartialC<{
        d: t.PartialC<{
            c: t.PartialC<{
                b: t.PartialC<{
                    a: t.StringC;
                }>;
            }>;
        }>;
    }>;
}>;
export declare const D5: t.RecordC<t.StringC, t.RecordC<t.StringC, t.RecordC<t.StringC, t.RecordC<t.StringC, t.RecordC<t.StringC, t.NumberC>>>>>;
export declare const U1: t.UnionC<[t.TypeC<{
    e: t.TypeC<{
        d: t.TypeC<{
            c: t.TypeC<{
                b: t.TypeC<{
                    a: t.StringC;
                }>;
            }>;
        }>;
    }>;
}>, t.RecordC<t.StringC, t.RecordC<t.StringC, t.RecordC<t.StringC, t.RecordC<t.StringC, t.RecordC<t.StringC, t.NumberC>>>>>]>;
export declare const I1: t.IntersectionC<[t.TypeC<{
    e: t.TypeC<{
        d: t.TypeC<{
            c: t.TypeC<{
                b: t.TypeC<{
                    a: t.StringC;
                }>;
            }>;
        }>;
    }>;
}>, t.RecordC<t.StringC, t.RecordC<t.StringC, t.RecordC<t.StringC, t.RecordC<t.StringC, t.RecordC<t.StringC, t.NumberC>>>>>]>;
export declare const Tu1: t.TupleC<[t.TypeC<{
    e: t.TypeC<{
        d: t.TypeC<{
            c: t.TypeC<{
                b: t.TypeC<{
                    a: t.StringC;
                }>;
            }>;
        }>;
    }>;
}>, t.RecordC<t.StringC, t.RecordC<t.StringC, t.RecordC<t.StringC, t.RecordC<t.StringC, t.RecordC<t.StringC, t.NumberC>>>>>]>;
export declare const RO1: t.ReadonlyC<t.TypeC<{
    e: t.TypeC<{
        d: t.TypeC<{
            c: t.TypeC<{
                b: t.TypeC<{
                    a: t.StringC;
                }>;
            }>;
        }>;
    }>;
}>>;
export declare const RA1: t.ReadonlyArrayC<t.TypeC<{
    e: t.TypeC<{
        d: t.TypeC<{
            c: t.TypeC<{
                b: t.TypeC<{
                    a: t.StringC;
                }>;
            }>;
        }>;
    }>;
}>>;
export declare const S5: t.StrictC<{
    e: t.StrictC<{
        d: t.StrictC<{
            c: t.StrictC<{
                b: t.StrictC<{
                    a: t.StringC;
                }>;
            }>;
        }>;
    }>;
}>;
export declare const TU1: t.TaggedUnionC<"type", [t.TypeC<{
    type: t.LiteralC<true>;
    foo: t.StringC;
}>, t.TypeC<{
    type: t.LiteralC<false>;
    bar: t.NumberC;
}>]>;
export declare const E1: t.ExactC<t.TypeC<{
    e: t.TypeC<{
        d: t.TypeC<{
            c: t.TypeC<{
                b: t.TypeC<{
                    a: t.StringC;
                }>;
            }>;
        }>;
    }>;
}>>;
export {};
